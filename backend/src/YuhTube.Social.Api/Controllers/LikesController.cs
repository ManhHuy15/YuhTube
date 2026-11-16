using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using YuhTube.Persistence.Contracts.DynamoDb;
using YuhTube.Social.Api.Configuration;
using YuhTube.Social.Api.Dtos;
using YuhTube.Social.Api.Helpers;

namespace YuhTube.Social.Api.Controllers;

[ApiController]
[Route("videos/{videoId}/like")]
public sealed class LikesController : ControllerBase
{
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly DynamoDbOptions _dynamoDbOptions;
    private readonly ILogger<LikesController> _logger;

    public LikesController(
        IAmazonDynamoDB dynamoDb,
        IOptions<DynamoDbOptions> dynamoDbOptions,
        ILogger<LikesController> logger)
    {
        _dynamoDb = dynamoDb;
        _dynamoDbOptions = dynamoDbOptions.Value;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType<LikeStatusResponseDto>(StatusCodes.Status200OK)]
    public async Task<ActionResult<LikeStatusResponseDto>> GetLikeStatus(
        string videoId,
        CancellationToken cancellationToken)
    {
        var count = await GetLikesCountAsync(videoId, cancellationToken);
        var isLiked = false;

        var identity = CognitoAuthHelper.ExtractUser(HttpContext);
        if (identity != null)
        {
            var likeItem = await _dynamoDb.GetItemAsync(new GetItemRequest
            {
                TableName = _dynamoDbOptions.TableName,
                Key = new Dictionary<string, AttributeValue>
                {
                    [DynamoAttributes.PartitionKey] = new() { S = VideoKeys.PartitionKey(videoId) },
                    [DynamoAttributes.SortKey] = new() { S = LikeKeys.SortKey(identity.UserId) }
                }
            }, cancellationToken);

            isLiked = likeItem.Item != null && likeItem.Item.Count > 0;
        }

        return Ok(new LikeStatusResponseDto(videoId, isLiked, count));
    }

    [HttpPost]
    [ProducesResponseType<LikeStatusResponseDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<LikeStatusResponseDto>> ToggleLike(
        string videoId,
        CancellationToken cancellationToken)
    {
        var identity = CognitoAuthHelper.ExtractUser(HttpContext);
        if (identity == null)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Unauthorized",
                Detail = "Authentication required to like a video.",
                Status = StatusCodes.Status401Unauthorized
            });
        }

        var likeKey = new Dictionary<string, AttributeValue>
        {
            [DynamoAttributes.PartitionKey] = new() { S = VideoKeys.PartitionKey(videoId) },
            [DynamoAttributes.SortKey] = new() { S = LikeKeys.SortKey(identity.UserId) }
        };

        var existingItem = await _dynamoDb.GetItemAsync(new GetItemRequest
        {
            TableName = _dynamoDbOptions.TableName,
            Key = likeKey
        }, cancellationToken);

        bool isLiked;
        if (existingItem.Item != null && existingItem.Item.Count > 0)
        {
            // Already liked -> remove like (Unlike)
            await _dynamoDb.DeleteItemAsync(new DeleteItemRequest
            {
                TableName = _dynamoDbOptions.TableName,
                Key = likeKey
            }, cancellationToken);

            isLiked = false;
            _logger.LogInformation("User {UserId} unliked video {VideoId}", identity.UserId, videoId);
        }
        else
        {
            // Not liked yet -> add like
            var now = DateTimeOffset.UtcNow.ToString("O");
            var item = new Dictionary<string, AttributeValue>
            {
                [DynamoAttributes.PartitionKey] = new() { S = VideoKeys.PartitionKey(videoId) },
                [DynamoAttributes.SortKey] = new() { S = LikeKeys.SortKey(identity.UserId) },
                [LikeAttributes.UserId] = new() { S = identity.UserId },
                [LikeAttributes.VideoId] = new() { S = videoId },
                [LikeAttributes.CreatedAt] = new() { S = now }
            };

            await _dynamoDb.PutItemAsync(new PutItemRequest
            {
                TableName = _dynamoDbOptions.TableName,
                Item = item
            }, cancellationToken);

            isLiked = true;
            _logger.LogInformation("User {UserId} liked video {VideoId}", identity.UserId, videoId);
        }

        var count = await GetLikesCountAsync(videoId, cancellationToken);
        return Ok(new LikeStatusResponseDto(videoId, isLiked, count));
    }

    private async Task<int> GetLikesCountAsync(string videoId, CancellationToken cancellationToken)
    {
        var countResponse = await _dynamoDb.QueryAsync(new QueryRequest
        {
            TableName = _dynamoDbOptions.TableName,
            KeyConditionExpression = "#pk = :pk AND begins_with(#sk, :likePrefix)",
            ExpressionAttributeNames = new Dictionary<string, string>
            {
                ["#pk"] = DynamoAttributes.PartitionKey,
                ["#sk"] = DynamoAttributes.SortKey
            },
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                [":pk"] = new() { S = VideoKeys.PartitionKey(videoId) },
                [":likePrefix"] = new() { S = LikeKeys.SortKeyPrefix }
            },
            Select = Select.COUNT
        }, cancellationToken);

        return countResponse.Count ?? 0;
    }
}
