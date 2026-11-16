using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using KsuidDotNet;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using YuhTube.Persistence.Contracts.DynamoDb;
using YuhTube.Social.Api.Configuration;
using YuhTube.Social.Api.Dtos;
using YuhTube.Social.Api.Helpers;

namespace YuhTube.Social.Api.Controllers;

[ApiController]
[Route("videos/{videoId}/comments")]
public sealed class CommentsController : ControllerBase
{
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly DynamoDbOptions _dynamoDbOptions;
    private readonly ILogger<CommentsController> _logger;

    public CommentsController(
        IAmazonDynamoDB dynamoDb,
        IOptions<DynamoDbOptions> dynamoDbOptions,
        ILogger<CommentsController> logger)
    {
        _dynamoDb = dynamoDb;
        _dynamoDbOptions = dynamoDbOptions.Value;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType<IReadOnlyList<CommentResponseDto>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<CommentResponseDto>>> GetComments(
        string videoId,
        CancellationToken cancellationToken)
    {
        var queryRequest = new QueryRequest
        {
            TableName = _dynamoDbOptions.TableName,
            KeyConditionExpression = "#pk = :pk AND begins_with(#sk, :commentPrefix)",
            ExpressionAttributeNames = new Dictionary<string, string>
            {
                ["#pk"] = DynamoAttributes.PartitionKey,
                ["#sk"] = DynamoAttributes.SortKey
            },
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                [":pk"] = new() { S = VideoKeys.PartitionKey(videoId) },
                [":commentPrefix"] = new() { S = CommentKeys.SortKeyPrefix }
            },
            ScanIndexForward = false // Newest first (KSUID is time-ordered)
        };

        var queryResponse = await _dynamoDb.QueryAsync(queryRequest, cancellationToken);
        var comments = new List<CommentResponseDto>(queryResponse.Items.Count);

        foreach (var item in queryResponse.Items)
        {
            if (!item.TryGetValue(DynamoAttributes.SortKey, out var skVal) || string.IsNullOrEmpty(skVal.S))
                continue;

            var commentId = skVal.S.StartsWith(CommentKeys.SortKeyPrefix, StringComparison.Ordinal)
                ? skVal.S[CommentKeys.SortKeyPrefix.Length..]
                : skVal.S;

            var content = item.TryGetValue(CommentAttributes.Content, out var cVal) ? cVal.S : string.Empty;
            var userId = item.TryGetValue(CommentAttributes.UserId, out var uVal) ? uVal.S : string.Empty;
            var userName = item.TryGetValue(CommentAttributes.UserName, out var unVal) ? unVal.S : "User";
            var userAvatar = item.TryGetValue(CommentAttributes.UserAvatar, out var uaVal) ? uaVal.S : null;
            var createdAt = item.TryGetValue(CommentAttributes.CreatedAt, out var caVal) ? caVal.S : string.Empty;

            comments.Add(new CommentResponseDto(
                Id: commentId,
                VideoId: videoId,
                Content: content,
                UserId: userId,
                UserName: userName,
                UserAvatar: userAvatar,
                CreatedAt: createdAt
            ));
        }

        return Ok(comments);
    }

    [HttpPost]
    [ProducesResponseType<CommentResponseDto>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<CommentResponseDto>> AddComment(
        string videoId,
        [FromBody] CreateCommentRequest request,
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
                Detail = "Authentication required to add a comment.",
                Status = StatusCodes.Status401Unauthorized
            });
        }

        var content = request.Content.Trim();
        if (string.IsNullOrWhiteSpace(content))
        {
            ModelState.AddModelError(nameof(request.Content), "Comment content cannot be blank.");
            return ValidationProblem(ModelState);
        }

        var commentId = Ksuid.NewKsuid().ToString();
        var now = DateTimeOffset.UtcNow.ToString("O");

        var item = new Dictionary<string, AttributeValue>
        {
            [DynamoAttributes.PartitionKey] = new() { S = VideoKeys.PartitionKey(videoId) },
            [DynamoAttributes.SortKey] = new() { S = CommentKeys.SortKey(commentId) },
            [CommentAttributes.CommentId] = new() { S = commentId },
            [LikeAttributes.VideoId] = new() { S = videoId },
            [CommentAttributes.Content] = new() { S = content },
            [CommentAttributes.UserId] = new() { S = identity.UserId },
            [CommentAttributes.UserName] = new() { S = identity.UserName },
            [CommentAttributes.CreatedAt] = new() { S = now }
        };

        if (!string.IsNullOrWhiteSpace(identity.UserAvatar))
        {
            item[CommentAttributes.UserAvatar] = new() { S = identity.UserAvatar };
        }

        await _dynamoDb.PutItemAsync(new PutItemRequest
        {
            TableName = _dynamoDbOptions.TableName,
            Item = item
        }, cancellationToken);

        _logger.LogInformation("Added comment {CommentId} to video {VideoId} by user {UserId}",
            commentId, videoId, identity.UserId);

        var responseDto = new CommentResponseDto(
            Id: commentId,
            VideoId: videoId,
            Content: content,
            UserId: identity.UserId,
            UserName: identity.UserName,
            UserAvatar: identity.UserAvatar,
            CreatedAt: now
        );

        return StatusCode(StatusCodes.Status201Created, responseDto);
    }

    [HttpDelete("{commentId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteComment(
        string videoId,
        string commentId,
        CancellationToken cancellationToken)
    {
        var identity = CognitoAuthHelper.ExtractUser(HttpContext);
        if (identity == null)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Unauthorized",
                Detail = "Authentication required to delete a comment.",
                Status = StatusCodes.Status401Unauthorized
            });
        }

        // Fetch comment item to verify ownership
        var getCommentResponse = await _dynamoDb.GetItemAsync(new GetItemRequest
        {
            TableName = _dynamoDbOptions.TableName,
            Key = new Dictionary<string, AttributeValue>
            {
                [DynamoAttributes.PartitionKey] = new() { S = VideoKeys.PartitionKey(videoId) },
                [DynamoAttributes.SortKey] = new() { S = CommentKeys.SortKey(commentId) }
            }
        }, cancellationToken);

        if (getCommentResponse.Item == null || getCommentResponse.Item.Count == 0)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Detail = "Comment not found.",
                Status = StatusCodes.Status404NotFound
            });
        }

        var commentAuthorId = getCommentResponse.Item.TryGetValue(CommentAttributes.UserId, out var uVal)
            ? uVal.S
            : string.Empty;

        var isAuthor = string.Equals(commentAuthorId, identity.UserId, StringComparison.Ordinal);

        if (!isAuthor)
        {
            // Check if user is the video's uploader
            var getVideoResponse = await _dynamoDb.GetItemAsync(new GetItemRequest
            {
                TableName = _dynamoDbOptions.TableName,
                Key = new Dictionary<string, AttributeValue>
                {
                    [DynamoAttributes.PartitionKey] = new() { S = VideoKeys.PartitionKey(videoId) },
                    [DynamoAttributes.SortKey] = new() { S = VideoKeys.SortKey(videoId) }
                }
            }, cancellationToken);

            var videoUploaderId = getVideoResponse.Item != null && getVideoResponse.Item.TryGetValue(VideoAttributes.UploaderId, out var upVal)
                ? upVal.S
                : string.Empty;

            var isVideoOwner = string.Equals(videoUploaderId, identity.UserId, StringComparison.Ordinal);

            if (!isVideoOwner)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new ProblemDetails
                {
                    Title = "Forbidden",
                    Detail = "You are not authorized to delete this comment.",
                    Status = StatusCodes.Status403Forbidden
                });
            }
        }

        await _dynamoDb.DeleteItemAsync(new DeleteItemRequest
        {
            TableName = _dynamoDbOptions.TableName,
            Key = new Dictionary<string, AttributeValue>
            {
                [DynamoAttributes.PartitionKey] = new() { S = VideoKeys.PartitionKey(videoId) },
                [DynamoAttributes.SortKey] = new() { S = CommentKeys.SortKey(commentId) }
            }
        }, cancellationToken);

        _logger.LogInformation("Deleted comment {CommentId} on video {VideoId} by {UserId}",
            commentId, videoId, identity.UserId);

        return NoContent();
    }
}
