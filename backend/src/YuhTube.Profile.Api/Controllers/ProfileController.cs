using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using YuhTube.Persistence.Contracts.DynamoDb;
using YuhTube.Profile.Api.Configuration;
using YuhTube.Profile.Api.Dtos;
using YuhTube.Profile.Api.Helpers;

namespace YuhTube.Profile.Api.Controllers;

[ApiController]
[Route("profile")]
public sealed class ProfileController : ControllerBase
{
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly DynamoDbOptions _dynamoDbOptions;
    private readonly ILogger<ProfileController> _logger;

    public ProfileController(
        IAmazonDynamoDB dynamoDb,
        IOptions<DynamoDbOptions> dynamoDbOptions,
        ILogger<ProfileController> logger)
    {
        _dynamoDb = dynamoDb;
        _dynamoDbOptions = dynamoDbOptions.Value;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType<UserProfileResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserProfileResponse>> GetProfile(CancellationToken cancellationToken)
    {
        var identity = CognitoAuthHelper.ExtractUser(HttpContext);
        if (identity == null)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Unauthorized",
                Detail = "Authentication required.",
                Status = StatusCodes.Status401Unauthorized
            });
        }

        var response = await _dynamoDb.GetItemAsync(new GetItemRequest
        {
            TableName = _dynamoDbOptions.TableName,
            Key = new Dictionary<string, AttributeValue>
            {
                [DynamoAttributes.PartitionKey] = new() { S = UserKeys.PartitionKey(identity.UserId) },
                [DynamoAttributes.SortKey] = new() { S = UserKeys.SortKey(identity.UserId) }
            }
        }, cancellationToken);

        var name = identity.UserName;
        var avatarUrl = identity.UserAvatar;

        if (response.Item != null && response.Item.Count > 0)
        {
            if (response.Item.TryGetValue(UserAttributes.ChannelName, out var nameVal) && !string.IsNullOrWhiteSpace(nameVal.S))
            {
                name = nameVal.S;
            }

            if (response.Item.TryGetValue(UserAttributes.AvatarUrl, out var avVal) && !string.IsNullOrWhiteSpace(avVal.S))
            {
                avatarUrl = avVal.S;
            }
        }

        return Ok(new UserProfileResponse(identity.UserId, name, avatarUrl));
    }

    [HttpPut]
    [ProducesResponseType<UserProfileResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserProfileResponse>> UpdateProfile(
        [FromBody] UpdateProfileRequest request,
        CancellationToken cancellationToken)
    {
        var identity = CognitoAuthHelper.ExtractUser(HttpContext);
        if (identity == null)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Unauthorized",
                Detail = "Authentication required.",
                Status = StatusCodes.Status401Unauthorized
            });
        }

        var now = DateTimeOffset.UtcNow.ToString("O");
        var updateExpressions = new List<string>
        {
            "#updatedAt = :now",
            "#createdAt = if_not_exists(#createdAt, :now)"
        };
        var attrNames = new Dictionary<string, string>
        {
            ["#updatedAt"] = UserAttributes.UpdatedAt,
            ["#createdAt"] = UserAttributes.CreatedAt
        };
        var attrValues = new Dictionary<string, AttributeValue>
        {
            [":now"] = new() { S = now }
        };

        var finalName = identity.UserName;
        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            finalName = request.Name.Trim();
            updateExpressions.Add("#name = :name");
            attrNames["#name"] = UserAttributes.ChannelName;
            attrValues[":name"] = new() { S = finalName };
        }

        var finalAvatar = identity.UserAvatar;
        if (!string.IsNullOrWhiteSpace(request.AvatarUrl))
        {
            finalAvatar = request.AvatarUrl.Trim();
            updateExpressions.Add("#avatar = :avatar");
            attrNames["#avatar"] = UserAttributes.AvatarUrl;
            attrValues[":avatar"] = new() { S = finalAvatar };
        }

        var updateRequest = new UpdateItemRequest
        {
            TableName = _dynamoDbOptions.TableName,
            Key = new Dictionary<string, AttributeValue>
            {
                [DynamoAttributes.PartitionKey] = new() { S = UserKeys.PartitionKey(identity.UserId) },
                [DynamoAttributes.SortKey] = new() { S = UserKeys.SortKey(identity.UserId) }
            },
            UpdateExpression = "SET " + string.Join(", ", updateExpressions),
            ExpressionAttributeNames = attrNames,
            ExpressionAttributeValues = attrValues,
            ReturnValues = ReturnValue.ALL_NEW
        };

        var updateResponse = await _dynamoDb.UpdateItemAsync(updateRequest, cancellationToken);
        _logger.LogInformation("Updated user profile for {UserId}. New Name: {Name}", identity.UserId, finalName);

        if (updateResponse.Attributes != null)
        {
            if (updateResponse.Attributes.TryGetValue(UserAttributes.ChannelName, out var nameVal) && !string.IsNullOrWhiteSpace(nameVal.S))
            {
                finalName = nameVal.S;
            }

            if (updateResponse.Attributes.TryGetValue(UserAttributes.AvatarUrl, out var avVal) && !string.IsNullOrWhiteSpace(avVal.S))
            {
                finalAvatar = avVal.S;
            }
        }

        return Ok(new UserProfileResponse(identity.UserId, finalName, finalAvatar));
    }
}
