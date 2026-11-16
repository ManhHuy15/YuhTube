using System.Text.Json;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Microsoft.Extensions.Logging;
using YuhTube.Persistence.Contracts.DynamoDb;
using YuhTube.ViewCountAggregator.Configuration;
using YuhTube.ViewCountAggregator.Model;

namespace YuhTube.ViewCountAggregator.Services;

public sealed class ViewCountAggregatorService
{
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly DynamoDbOptions _dynamoDbOptions;
    private readonly ILogger<ViewCountAggregatorService> _logger;

    public ViewCountAggregatorService(
        IAmazonDynamoDB dynamoDb,
        DynamoDbOptions dynamoDbOptions,
        ILogger<ViewCountAggregatorService> logger)
    {
        _dynamoDb = dynamoDb;
        _dynamoDbOptions = dynamoDbOptions;
        _logger = logger;
    }

    public async Task<SqsBatchResponse> ProcessBatchAsync(
        IReadOnlyList<SqsRecord> records,
        CancellationToken cancellationToken)
    {
        var response = new SqsBatchResponse();
        if (records == null || records.Count == 0)
        {
            return response;
        }

        _logger.LogInformation("Processing batch of {Count} SQS view event records.", records.Count);

        // In-memory aggregation: group by videoId
        var aggregatedViews = new Dictionary<string, (long Count, List<string> MessageIds)>(StringComparer.Ordinal);
        var unparseableMessageIds = new List<string>();

        foreach (var record in records)
        {
            var videoId = ExtractVideoId(record.Body);
            if (string.IsNullOrWhiteSpace(videoId))
            {
                _logger.LogWarning("Record {MessageId} has missing or invalid videoId in body: {Body}",
                    record.MessageId, record.Body);
                // Non-retriable poison message: do not add to failures to avoid infinite loop
                continue;
            }

            if (!aggregatedViews.TryGetValue(videoId, out var val))
            {
                val = (0L, new List<string>());
                aggregatedViews[videoId] = val;
            }

            aggregatedViews[videoId] = (val.Count + 1, val.MessageIds);
            aggregatedViews[videoId].MessageIds.Add(record.MessageId);
        }

        _logger.LogInformation(
            "Aggregated {TotalViews} view events into {UniqueVideos} unique video updates.",
            records.Count, aggregatedViews.Count);

        // Perform parallel atomic updates in DynamoDB for each aggregated video
        var updateTasks = aggregatedViews.Select(async kvp =>
        {
            var (videoId, (count, messageIds)) = (kvp.Key, kvp.Value);
            try
            {
                await IncrementViewCountAsync(videoId, count, cancellationToken);
                _logger.LogInformation(
                    "Successfully incremented views by +{Count} for video {VideoId}.",
                    count, videoId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Failed to increment views by +{Count} for video {VideoId}. Marking {MsgCount} messages as failed for retry.",
                    count, videoId, messageIds.Count);

                lock (response.BatchItemFailures)
                {
                    foreach (var msgId in messageIds)
                    {
                        response.BatchItemFailures.Add(new SqsBatchResponse.BatchItemFailure
                        {
                            ItemIdentifier = msgId
                        });
                    }
                }
            }
        });

        await Task.WhenAll(updateTasks);

        return response;
    }

    private async Task IncrementViewCountAsync(
        string videoId,
        long incrementBy,
        CancellationToken cancellationToken)
    {
        var request = new UpdateItemRequest
        {
            TableName = _dynamoDbOptions.TableName,
            Key = new Dictionary<string, AttributeValue>
            {
                [DynamoAttributes.PartitionKey] = new() { S = VideoKeys.PartitionKey(videoId) },
                [DynamoAttributes.SortKey] = new() { S = VideoKeys.SortKey(videoId) }
            },
            UpdateExpression = "SET #views = if_not_exists(#views, :zero) + :incr",
            ExpressionAttributeNames = new Dictionary<string, string>
            {
                ["#views"] = VideoAttributes.Views
            },
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                [":zero"] = new() { N = "0" },
                [":incr"] = new() { N = incrementBy.ToString() }
            }
        };

        await _dynamoDb.UpdateItemAsync(request, cancellationToken);
    }

    private static string? ExtractVideoId(string body)
    {
        if (string.IsNullOrWhiteSpace(body))
            return null;

        var trimmed = body.Trim();

        // 1. Try parsing JSON object { "videoId": "..." }
        if (trimmed.StartsWith('{') && trimmed.EndsWith('}'))
        {
            try
            {
                var payload = JsonSerializer.Deserialize<ViewMessagePayload>(trimmed);
                if (!string.IsNullOrWhiteSpace(payload?.VideoId))
                {
                    return payload.VideoId.Trim();
                }
            }
            catch
            {
                // Fall through to raw string
            }
        }

        // 2. Fallback: Raw videoId string (strip quotes if any)
        var raw = trimmed.Trim('"', '\'');
        return !string.IsNullOrWhiteSpace(raw) ? raw : null;
    }
}
