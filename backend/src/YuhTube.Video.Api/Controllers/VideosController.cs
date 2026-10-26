using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using YuhTube.Persistence.Contracts.DynamoDb;
using YuhTube.Video.Api.Configuration;
using YuhTube.Video.Api.Dtos;
using YuhTube.Video.Api.Helpers;

namespace YuhTube.Video.Api.Controllers;

[ApiController]
[Route("videos")]
public sealed class VideosController : ControllerBase
{
    private const int DefaultLimit = 12;
    private const int MaxLimit = 50;

    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly DynamoDbOptions _dynamoDbOptions;
    private readonly ILogger<VideosController> _logger;

    public VideosController(
        IAmazonDynamoDB dynamoDb,
        IOptions<DynamoDbOptions> dynamoDbOptions,
        ILogger<VideosController> logger)
    {
        _dynamoDb = dynamoDb;
        _dynamoDbOptions = dynamoDbOptions.Value;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType<PagedVideoFeedResponse>(StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedVideoFeedResponse>> GetFeed(
        [FromQuery] string? cursor = null,
        [FromQuery] int limit = DefaultLimit,
        [FromQuery] string? uploaderId = null,
        CancellationToken cancellationToken = default)
    {
        var clampedLimit = Math.Clamp(limit, 1, MaxLimit);
        var exclusiveStartKey = PaginationHelper.DecodeCursor(cursor);

        Dictionary<string, AttributeValue>? lastEvaluatedKey;
        var items = new List<VideoFeedItemDto>();

        if (!string.IsNullOrWhiteSpace(uploaderId))
        {
            var queryRequest = new QueryRequest
            {
                TableName = _dynamoDbOptions.TableName,
                IndexName = "GSI1",
                KeyConditionExpression = "#gsi1Pk = :uploaderId",
                ExpressionAttributeNames = new Dictionary<string, string>
                {
                    ["#gsi1Pk"] = VideoAttributes.Gsi1PartitionKey
                },
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    [":uploaderId"] = new() { S = uploaderId }
                },
                Limit = clampedLimit,
                ScanIndexForward = false,
                ExclusiveStartKey = exclusiveStartKey
            };

            var queryResponse = await _dynamoDb.QueryAsync(queryRequest, cancellationToken);
            items.AddRange(queryResponse.Items.Select(VideoMappingHelper.MapFeedItem));
            lastEvaluatedKey = queryResponse.LastEvaluatedKey;
        }
        else
        {
            // Query public Home Feed using GSI2 (newest first, zero scan)
            var queryRequest = new QueryRequest
            {
                TableName = _dynamoDbOptions.TableName,
                IndexName = "GSI2",
                KeyConditionExpression = "#gsi2Pk = :feedTag",
                ExpressionAttributeNames = new Dictionary<string, string>
                {
                    ["#gsi2Pk"] = VideoAttributes.Gsi2PartitionKey
                },
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    [":feedTag"] = new() { S = VideoAttributes.FeedPartitionTag }
                },
                Limit = clampedLimit,
                ScanIndexForward = false,
                ExclusiveStartKey = exclusiveStartKey
            };

            var queryResponse = await _dynamoDb.QueryAsync(queryRequest, cancellationToken);
            items.AddRange(queryResponse.Items.Select(VideoMappingHelper.MapFeedItem));
            lastEvaluatedKey = queryResponse.LastEvaluatedKey;
        }

        var nextCursor = PaginationHelper.EncodeCursor(lastEvaluatedKey);
        return Ok(new PagedVideoFeedResponse(items, nextCursor));
    }

    [HttpGet("{id}")]
    [ProducesResponseType<VideoDetailResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VideoDetailResponse>> GetById(
        string id,
        CancellationToken cancellationToken)
    {
        // Pre-join: Single query on PK = VIDEO#<id> to read Video Metadata, Comments, and Likes
        var queryResponse = await _dynamoDb.QueryAsync(new QueryRequest
        {
            TableName = _dynamoDbOptions.TableName,
            KeyConditionExpression = "#pk = :pk",
            ExpressionAttributeNames = new Dictionary<string, string>
            {
                ["#pk"] = DynamoAttributes.PartitionKey
            },
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                [":pk"] = new() { S = VideoKeys.PartitionKey(id) }
            }
        }, cancellationToken);

        if (queryResponse.Count == 0)
        {
            return NotFound();
        }

        var targetMetaSk = VideoKeys.SortKey(id);
        Dictionary<string, AttributeValue>? metaItem = null;
        var comments = new List<VideoCommentDto>();
        var likesCount = 0;

        foreach (var item in queryResponse.Items)
        {
            if (!item.TryGetValue(DynamoAttributes.SortKey, out var skValue) || string.IsNullOrEmpty(skValue.S))
            {
                continue;
            }

            var sk = skValue.S;
            if (sk == targetMetaSk)
            {
                metaItem = item;
            }
            else if (sk.StartsWith(LikeKeys.SortKeyPrefix, StringComparison.Ordinal))
            {
                likesCount++;
            }
            else if (sk.StartsWith(CommentKeys.SortKeyPrefix, StringComparison.Ordinal))
            {
                var commentId = sk[CommentKeys.SortKeyPrefix.Length..];
                comments.Add(new VideoCommentDto(
                    Id: commentId,
                    Content: VideoMappingHelper.GetString(item, "Content", string.Empty),
                    UserId: VideoMappingHelper.GetString(item, "UserID", string.Empty),
                    UserName: VideoMappingHelper.GetString(item, "UserName", string.Empty),
                    UserAvatar: VideoMappingHelper.GetNullableString(item, "UserAvatar"),
                    CreatedAt: VideoMappingHelper.GetString(item, "CreatedAt", string.Empty)
                ));
            }
        }

        if (metaItem == null)
        {
            return NotFound();
        }

        var detail = VideoMappingHelper.MapDetail(id, metaItem, likesCount, comments);
        return Ok(detail);
    }

    [HttpPut("{id}")]
    [ProducesResponseType<VideoDetailResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<VideoDetailResponse>> UpdateMetadata(
        string id,
        [FromBody] UpdateVideoMetadataRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var now = DateTimeOffset.UtcNow.ToString("O");
        var updateExpressions = new List<string>
        {
            "#title = :title",
            "#updatedAt = :now",
            "#videoId = if_not_exists(#videoId, :videoId)",
            "#status = if_not_exists(#status, :defaultStatus)",
            "#createdAt = if_not_exists(#createdAt, :now)"
        };

        var attributeNames = new Dictionary<string, string>
        {
            ["#title"] = VideoAttributes.Title,
            ["#updatedAt"] = VideoAttributes.UpdatedAt,
            ["#videoId"] = VideoAttributes.VideoId,
            ["#status"] = VideoAttributes.Status,
            ["#createdAt"] = VideoAttributes.CreatedAt
        };

        var attributeValues = new Dictionary<string, AttributeValue>
        {
            [":title"] = new() { S = request.Title.Trim() },
            [":now"] = new() { S = now },
            [":videoId"] = new() { S = id },
            [":defaultStatus"] = new() { S = VideoStatuses.Processing }
        };

        if (request.Description != null)
        {
            updateExpressions.Add("#description = :description");
            attributeNames["#description"] = VideoAttributes.Description;
            attributeValues[":description"] = new() { S = request.Description };
        }

        if (!string.IsNullOrWhiteSpace(request.ThumbnailUrl))
        {
            updateExpressions.Add("#thumbnailUrl = :thumbnailUrl");
            attributeNames["#thumbnailUrl"] = VideoAttributes.ThumbnailUrl;
            attributeValues[":thumbnailUrl"] = new() { S = request.ThumbnailUrl.Trim() };
        }

        var removeExpressions = new List<string>();

        if (request.IsPrivate.HasValue)
        {
            updateExpressions.Add("#isPrivate = :isPrivate");
            attributeNames["#isPrivate"] = VideoAttributes.IsPrivate;
            attributeValues[":isPrivate"] = new() { BOOL = request.IsPrivate.Value };

            if (request.IsPrivate.Value)
            {
                // Remove from GSI2 index so private video does not appear in public feed (Sparse GSI)
                removeExpressions.Add("#gsi2Pk");
                removeExpressions.Add("#gsi2Sk");
                attributeNames["#gsi2Pk"] = VideoAttributes.Gsi2PartitionKey;
                attributeNames["#gsi2Sk"] = VideoAttributes.Gsi2SortKey;
            }
            else
            {
                updateExpressions.Add("#gsi2Pk = :gsi2Pk");
                updateExpressions.Add("#gsi2Sk = if_not_exists(#gsi2Sk, :now)");
                attributeNames["#gsi2Pk"] = VideoAttributes.Gsi2PartitionKey;
                attributeNames["#gsi2Sk"] = VideoAttributes.Gsi2SortKey;
                attributeValues[":gsi2Pk"] = new() { S = VideoAttributes.FeedPartitionTag };
            }
        }
        else
        {
            updateExpressions.Add("#gsi2Pk = if_not_exists(#gsi2Pk, :gsi2Pk)");
            updateExpressions.Add("#gsi2Sk = if_not_exists(#gsi2Sk, :now)");
            attributeNames["#gsi2Pk"] = VideoAttributes.Gsi2PartitionKey;
            attributeNames["#gsi2Sk"] = VideoAttributes.Gsi2SortKey;
            attributeValues[":gsi2Pk"] = new() { S = VideoAttributes.FeedPartitionTag };
        }

        var updateExpressionText = "SET " + string.Join(", ", updateExpressions);
        if (removeExpressions.Count > 0)
        {
            updateExpressionText += " REMOVE " + string.Join(", ", removeExpressions);
        }

        var updateRequest = new UpdateItemRequest
        {
            TableName = _dynamoDbOptions.TableName,
            Key = new Dictionary<string, AttributeValue>
            {
                [DynamoAttributes.PartitionKey] = new() { S = VideoKeys.PartitionKey(id) },
                [DynamoAttributes.SortKey] = new() { S = VideoKeys.SortKey(id) }
            },
            UpdateExpression = updateExpressionText,
            ExpressionAttributeNames = attributeNames,
            ExpressionAttributeValues = attributeValues,
            ReturnValues = ReturnValue.ALL_NEW
        };

        var updateResponse = await _dynamoDb.UpdateItemAsync(updateRequest, cancellationToken);
        _logger.LogInformation("Updated metadata for video {VideoId}.", id);

        var detail = VideoMappingHelper.MapDetail(id, updateResponse.Attributes, likesCount: 0, comments: Array.Empty<VideoCommentDto>());
        return Ok(detail);
    }
}
