using System.Security.Claims;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Amazon.S3;
using Amazon.S3.Model;
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
    private readonly IAmazonS3 _s3;
    private readonly DynamoDbOptions _dynamoDbOptions;
    private readonly StorageOptions _storageOptions;
    private readonly ILogger<VideosController> _logger;

    public VideosController(
        IAmazonDynamoDB dynamoDb,
        IAmazonS3 s3,
        IOptions<DynamoDbOptions> dynamoDbOptions,
        IOptions<StorageOptions> storageOptions,
        ILogger<VideosController> logger)
    {
        _dynamoDb = dynamoDb;
        _s3 = s3;
        _dynamoDbOptions = dynamoDbOptions.Value;
        _storageOptions = storageOptions.Value;
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

        QueryRequest queryRequest;

        if (!string.IsNullOrWhiteSpace(uploaderId))
        {
            queryRequest = new QueryRequest
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
        }
        else
        {
            // Query public Home Feed using GSI2 (newest first, zero scan)
            queryRequest = new QueryRequest
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
        }

        var queryResponse = await _dynamoDb.QueryAsync(queryRequest, cancellationToken);
        lastEvaluatedKey = queryResponse.LastEvaluatedKey;

        if (queryResponse.Items.Count > 0)
        {
            var uploaderIds = queryResponse.Items.Select(i => VideoMappingHelper.GetString(i, VideoAttributes.UploaderId, string.Empty));
            var profiles = await GetUserProfilesAsync(uploaderIds, cancellationToken);

            items.AddRange(queryResponse.Items.Select(i =>
            {
                var uid = VideoMappingHelper.GetString(i, VideoAttributes.UploaderId, string.Empty);
                var profile = profiles.TryGetValue(uid, out var p) ? p : ((string Name, string? Avatar)?)null;
                return VideoMappingHelper.MapFeedItem(i, profile);
            }));
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

        var uploaderId = VideoMappingHelper.GetString(metaItem, VideoAttributes.UploaderId, string.Empty);
        var profiles = await GetUserProfilesAsync([uploaderId], cancellationToken);
        var profile = profiles.TryGetValue(uploaderId, out var p) ? p : ((string Name, string? Avatar)?)null;

        var detail = VideoMappingHelper.MapDetail(id, metaItem, likesCount, comments, profile);
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

        var identity = CognitoAuthHelper.ExtractUser(HttpContext);
        if (identity == null)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Unauthorized",
                Detail = "Authentication required to update video metadata.",
                Status = StatusCodes.Status401Unauthorized
            });
        }

        var uploaderId = identity.UserId;
        var uploaderName = identity.UserName;
        var uploaderAvatar = identity.UserAvatar ?? $"https://api.dicebear.com/7.x/initials/svg?seed={Uri.EscapeDataString(uploaderName)}";

        var existingItem = await _dynamoDb.GetItemAsync(new GetItemRequest
        {
            TableName = _dynamoDbOptions.TableName,
            Key = new Dictionary<string, AttributeValue>
            {
                [DynamoAttributes.PartitionKey] = new() { S = VideoKeys.PartitionKey(id) },
                [DynamoAttributes.SortKey] = new() { S = VideoKeys.SortKey(id) }
            }
        }, cancellationToken);

        if (existingItem.Item != null &&
            existingItem.Item.TryGetValue(VideoAttributes.UploaderId, out var existingUploader) &&
            !string.IsNullOrWhiteSpace(existingUploader.S) &&
            !string.Equals(existingUploader.S, uploaderId, StringComparison.OrdinalIgnoreCase))
        {
            return Forbid();
        }

        var now = DateTimeOffset.UtcNow.ToString("O");
        var updateExpressions = new List<string>
        {
            "#title = :title",
            "#updatedAt = :now",
            "#videoId = if_not_exists(#videoId, :videoId)",
            "#status = if_not_exists(#status, :defaultStatus)",
            "#createdAt = if_not_exists(#createdAt, :now)",
            "#uploaderId = if_not_exists(#uploaderId, :uploaderId)",
            "#uploaderName = if_not_exists(#uploaderName, :uploaderName)",
            "#uploaderAvatar = if_not_exists(#uploaderAvatar, :uploaderAvatar)",
            "#gsi1Pk = if_not_exists(#gsi1Pk, :gsi1Pk)",
            "#gsi1Sk = if_not_exists(#gsi1Sk, :now)"
        };

        var attributeNames = new Dictionary<string, string>
        {
            ["#title"] = VideoAttributes.Title,
            ["#updatedAt"] = VideoAttributes.UpdatedAt,
            ["#videoId"] = VideoAttributes.VideoId,
            ["#status"] = VideoAttributes.Status,
            ["#createdAt"] = VideoAttributes.CreatedAt,
            ["#uploaderId"] = VideoAttributes.UploaderId,
            ["#uploaderName"] = VideoAttributes.UploaderName,
            ["#uploaderAvatar"] = VideoAttributes.UploaderAvatar,
            ["#gsi1Pk"] = VideoAttributes.Gsi1PartitionKey,
            ["#gsi1Sk"] = VideoAttributes.Gsi1SortKey
        };

        var attributeValues = new Dictionary<string, AttributeValue>
        {
            [":title"] = new() { S = request.Title.Trim() },
            [":now"] = new() { S = now },
            [":videoId"] = new() { S = id },
            [":defaultStatus"] = new() { S = VideoStatuses.Processing },
            [":uploaderId"] = new() { S = uploaderId },
            [":uploaderName"] = new() { S = uploaderName },
            [":uploaderAvatar"] = new() { S = uploaderAvatar },
            [":gsi1Pk"] = new() { S = uploaderId }
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

        var profiles = await GetUserProfilesAsync([uploaderId], cancellationToken);
        var profile = profiles.TryGetValue(uploaderId, out var p) ? p : ((string Name, string? Avatar)?)null;

        var detail = VideoMappingHelper.MapDetail(id, updateResponse.Attributes, likesCount: 0, comments: Array.Empty<VideoCommentDto>(), profile);
        return Ok(detail);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteVideo(
        string id,
        CancellationToken cancellationToken)
    {
        var identity = CognitoAuthHelper.ExtractUser(HttpContext);
        if (identity == null)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Unauthorized",
                Detail = "Authentication required to delete a video.",
                Status = StatusCodes.Status401Unauthorized
            });
        }

        // 1. Check if video exists and user has ownership
        var existingItem = await _dynamoDb.GetItemAsync(new GetItemRequest
        {
            TableName = _dynamoDbOptions.TableName,
            Key = new Dictionary<string, AttributeValue>
            {
                [DynamoAttributes.PartitionKey] = new() { S = VideoKeys.PartitionKey(id) },
                [DynamoAttributes.SortKey] = new() { S = VideoKeys.SortKey(id) }
            }
        }, cancellationToken);

        if (existingItem.Item == null || existingItem.Item.Count == 0)
        {
            return NotFound();
        }

        if (existingItem.Item.TryGetValue(VideoAttributes.UploaderId, out var existingUploader) &&
            !string.IsNullOrWhiteSpace(existingUploader.S) &&
            !string.Equals(existingUploader.S, "channel-default", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(existingUploader.S, "anonymous-uploader", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(existingUploader.S, identity.UserId, StringComparison.OrdinalIgnoreCase))
        {
            return Forbid();
        }

        _logger.LogInformation("Hard deleting video {VideoId} by user {UserId}", id, identity.UserId);

        // 2. Delete S3 objects in Raw bucket (raw/{id}/*)
        if (!string.IsNullOrWhiteSpace(_storageOptions.RawBucketName))
        {
            await DeleteS3PrefixAsync(_storageOptions.RawBucketName, $"raw/{id}/", cancellationToken);
        }

        // 3. Delete S3 objects in Processed bucket (videos/{id}/* and thumbnails/{id}/*)
        if (!string.IsNullOrWhiteSpace(_storageOptions.ProcessedBucketName))
        {
            await DeleteS3PrefixAsync(_storageOptions.ProcessedBucketName, $"videos/{id}/", cancellationToken);
            await DeleteS3PrefixAsync(_storageOptions.ProcessedBucketName, $"thumbnails/{id}/", cancellationToken);
        }

        // 4. Delete all DynamoDB items with PK = VIDEO#{id} (META, COMMENT#*, LIKE#*)
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

        foreach (var item in queryResponse.Items)
        {
            if (item.TryGetValue(DynamoAttributes.SortKey, out var sk))
            {
                await _dynamoDb.DeleteItemAsync(new DeleteItemRequest
                {
                    TableName = _dynamoDbOptions.TableName,
                    Key = new Dictionary<string, AttributeValue>
                    {
                        [DynamoAttributes.PartitionKey] = new() { S = VideoKeys.PartitionKey(id) },
                        [DynamoAttributes.SortKey] = sk
                    }
                }, cancellationToken);
            }
        }

        // 5. Delete UploadSession item: PK = UPLOAD#{id}, SK = SESSION
        await _dynamoDb.DeleteItemAsync(new DeleteItemRequest
        {
            TableName = _dynamoDbOptions.TableName,
            Key = new Dictionary<string, AttributeValue>
            {
                [DynamoAttributes.PartitionKey] = new() { S = UploadSessionKeys.PartitionKey(id) },
                [DynamoAttributes.SortKey] = new() { S = UploadSessionKeys.SortKeyTag }
            }
        }, cancellationToken);

        _logger.LogInformation("Successfully hard deleted all S3 objects and DynamoDB records for video {VideoId}.", id);
        return NoContent();
    }

    private async Task DeleteS3PrefixAsync(
        string bucketName,
        string prefix,
        CancellationToken cancellationToken)
    {
        try
        {
            string? continuationToken = null;
            do
            {
                var listResponse = await _s3.ListObjectsV2Async(new ListObjectsV2Request
                {
                    BucketName = bucketName,
                    Prefix = prefix,
                    ContinuationToken = continuationToken
                }, cancellationToken);

                if (listResponse.S3Objects != null && listResponse.S3Objects.Count > 0)
                {
                    var deleteRequest = new DeleteObjectsRequest
                    {
                        BucketName = bucketName,
                        Objects = listResponse.S3Objects.Select(o => new KeyVersion { Key = o.Key }).ToList()
                    };
                    await _s3.DeleteObjectsAsync(deleteRequest, cancellationToken);
                    _logger.LogInformation("Deleted {Count} S3 objects in bucket {Bucket} with prefix {Prefix}",
                        listResponse.S3Objects.Count, bucketName, prefix);
                }

                continuationToken = listResponse.NextContinuationToken;
            } while (!string.IsNullOrEmpty(continuationToken));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete S3 objects under bucket {Bucket} with prefix {Prefix}", bucketName, prefix);
        }
    }

    private async Task<Dictionary<string, (string Name, string? Avatar)>> GetUserProfilesAsync(
        IEnumerable<string> userIds,
        CancellationToken cancellationToken)
    {
        var profiles = new Dictionary<string, (string Name, string? Avatar)>(StringComparer.OrdinalIgnoreCase);
        var distinctIds = userIds
            .Where(id => !string.IsNullOrWhiteSpace(id) && id != "channel-default" && id != "anonymous-uploader")
            .Distinct()
            .ToList();

        if (distinctIds.Count == 0) return profiles;

        var tasks = distinctIds.Select(async uid =>
        {
            try
            {
                var res = await _dynamoDb.GetItemAsync(new GetItemRequest
                {
                    TableName = _dynamoDbOptions.TableName,
                    Key = new Dictionary<string, AttributeValue>
                    {
                        [DynamoAttributes.PartitionKey] = new() { S = UserKeys.PartitionKey(uid) },
                        [DynamoAttributes.SortKey] = new() { S = UserKeys.SortKey(uid) }
                    }
                }, cancellationToken);

                if (res.Item != null && res.Item.Count > 0)
                {
                    var name = VideoMappingHelper.GetString(res.Item, UserAttributes.ChannelName, string.Empty);
                    var avatar = VideoMappingHelper.GetNullableString(res.Item, UserAttributes.AvatarUrl);
                    return (uid, name, avatar);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to load profile for user {UserId}", uid);
            }

            return (uid, string.Empty, (string?)null);
        });

        var results = await Task.WhenAll(tasks);
        foreach (var (uid, name, avatar) in results)
        {
            if (!string.IsNullOrWhiteSpace(name) || !string.IsNullOrWhiteSpace(avatar))
            {
                profiles[uid] = (name, avatar);
            }
        }

        return profiles;
    }
}
