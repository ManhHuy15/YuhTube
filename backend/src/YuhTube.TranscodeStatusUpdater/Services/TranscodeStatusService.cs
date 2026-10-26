using System.Text.Json;
using System.Text.RegularExpressions;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Microsoft.Extensions.Logging;
using YuhTube.Persistence.Contracts.DynamoDb;
using YuhTube.TranscodeStatusUpdater.Configuration;

namespace YuhTube.TranscodeStatusUpdater.Services;

public sealed partial class TranscodeStatusService
{
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly DynamoDbOptions _dynamoDbOptions;
    private readonly StorageOptions _storageOptions;
    private readonly ILogger<TranscodeStatusService> _logger;

    public TranscodeStatusService(
        IAmazonDynamoDB dynamoDb,
        DynamoDbOptions dynamoDbOptions,
        StorageOptions storageOptions,
        ILogger<TranscodeStatusService> logger)
    {
        _dynamoDb = dynamoDb;
        _dynamoDbOptions = dynamoDbOptions;
        _storageOptions = storageOptions;
        _logger = logger;
    }

    public async Task<TranscodeEventResult> ProcessEventAsync(
        JsonElement detail,
        CancellationToken cancellationToken = default)
    {
        if (!detail.TryGetProperty("status", out var statusProp))
        {
            _logger.LogWarning("Event detail does not contain a 'status' property.");
            return TranscodeEventResult.Ignored;
        }

        var status = statusProp.GetString();
        var jobId = (detail.TryGetProperty("jobId", out var jobIdProp) ? jobIdProp.GetString() : null) ?? "unknown";

        if (!string.Equals(status, "COMPLETE", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(status, "ERROR", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogInformation("Ignored transcode event for job {JobId} with status: {Status}.", jobId, status);
            return TranscodeEventResult.Ignored;
        }

        var videoId = ExtractVideoId(detail);
        if (string.IsNullOrWhiteSpace(videoId))
        {
            _logger.LogWarning("Could not determine videoId for transcode job {JobId}.", jobId);
            return TranscodeEventResult.VideoIdNotFound;
        }

        _logger.LogInformation(
            "Processing transcode event {Status} for video {VideoId} (MediaConvert Job: {JobId}).",
            status,
            videoId,
            jobId);

        if (string.Equals(status, "COMPLETE", StringComparison.OrdinalIgnoreCase))
        {
            await HandleCompleteAsync(videoId, jobId, detail, cancellationToken);
        }
        else
        {
            await HandleErrorAsync(videoId, jobId, detail, cancellationToken);
        }

        return TranscodeEventResult.Updated;
    }

    private async Task HandleCompleteAsync(
        string videoId,
        string jobId,
        JsonElement detail,
        CancellationToken cancellationToken)
    {
        var durationMs = ExtractDurationMs(detail);
        var playbackUrl = BuildPlaybackUrl(videoId, detail);
        var defaultThumbnailUrl = BuildThumbnailUrl(videoId);
        var now = DateTimeOffset.UtcNow.ToString("O");

        // 1. Update UploadSession in DynamoDB
        var updateSessionRequest = new UpdateItemRequest
        {
            TableName = _dynamoDbOptions.TableName,
            Key = new Dictionary<string, AttributeValue>
            {
                [DynamoAttributes.PartitionKey] = new() { S = UploadSessionKeys.PartitionKey(videoId) },
                [DynamoAttributes.SortKey] = new() { S = UploadSessionKeys.SortKeyTag }
            },
            UpdateExpression = "SET #transcodeStatus = :completed, #completedAt = :completedAt, #playbackUrl = :playbackUrl, #durationMs = :durationMs",
            ExpressionAttributeNames = new Dictionary<string, string>
            {
                ["#transcodeStatus"] = UploadSessionAttributes.TranscodeStatus,
                ["#completedAt"] = UploadSessionAttributes.TranscodeCompletedAt,
                ["#playbackUrl"] = UploadSessionAttributes.PlaybackUrl,
                ["#durationMs"] = UploadSessionAttributes.DurationMs
            },
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                [":completed"] = new() { S = TranscodeStatuses.Completed },
                [":completedAt"] = new() { S = now },
                [":playbackUrl"] = new() { S = playbackUrl },
                [":durationMs"] = new() { N = durationMs.ToString() }
            }
        };

        await _dynamoDb.UpdateItemAsync(updateSessionRequest, cancellationToken);

        // 2. Update / Initialize Video metadata in DynamoDB Single-Table
        var updateVideoRequest = new UpdateItemRequest
        {
            TableName = _dynamoDbOptions.TableName,
            Key = new Dictionary<string, AttributeValue>
            {
                [DynamoAttributes.PartitionKey] = new() { S = VideoKeys.PartitionKey(videoId) },
                [DynamoAttributes.SortKey] = new() { S = VideoKeys.SortKey(videoId) }
            },
            UpdateExpression = "SET #videoId = :videoId, #status = :ready, #playbackUrl = :playbackUrl, #durationMs = :durationMs, #updatedAt = :now, #createdAt = if_not_exists(#createdAt, :now), #title = if_not_exists(#title, :defaultTitle), #thumbnailUrl = if_not_exists(#thumbnailUrl, :defaultThumbnailUrl), #gsi2Pk = if_not_exists(#gsi2Pk, :gsi2Pk), #gsi2Sk = if_not_exists(#gsi2Sk, :now)",
            ExpressionAttributeNames = new Dictionary<string, string>
            {
                ["#videoId"] = VideoAttributes.VideoId,
                ["#status"] = VideoAttributes.Status,
                ["#playbackUrl"] = VideoAttributes.PlaybackUrl,
                ["#durationMs"] = VideoAttributes.DurationMs,
                ["#updatedAt"] = VideoAttributes.UpdatedAt,
                ["#createdAt"] = VideoAttributes.CreatedAt,
                ["#title"] = VideoAttributes.Title,
                ["#thumbnailUrl"] = VideoAttributes.ThumbnailUrl,
                ["#gsi2Pk"] = VideoAttributes.Gsi2PartitionKey,
                ["#gsi2Sk"] = VideoAttributes.Gsi2SortKey
            },
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                [":videoId"] = new() { S = videoId },
                [":ready"] = new() { S = VideoStatuses.Ready },
                [":playbackUrl"] = new() { S = playbackUrl },
                [":durationMs"] = new() { N = durationMs.ToString() },
                [":now"] = new() { S = now },
                [":defaultTitle"] = new() { S = $"Video {videoId}" },
                [":defaultThumbnailUrl"] = new() { S = defaultThumbnailUrl },
                [":gsi2Pk"] = new() { S = VideoAttributes.FeedPartitionTag }
            }
        };

        await _dynamoDb.UpdateItemAsync(updateVideoRequest, cancellationToken);

        _logger.LogInformation(
            "Successfully marked video {VideoId} as READY. Playback URL: {PlaybackUrl}, Duration: {DurationMs}ms.",
            videoId,
            playbackUrl,
            durationMs);
    }

    private async Task HandleErrorAsync(
        string videoId,
        string jobId,
        JsonElement detail,
        CancellationToken cancellationToken)
    {
        var errorMessage = detail.TryGetProperty("errorMessage", out var err) ? err.GetString() : "Transcode failed.";
        var errorCode = detail.TryGetProperty("errorCode", out var code) ? code.ToString() : null;
        var fullError = string.IsNullOrWhiteSpace(errorCode) ? errorMessage : $"[{errorCode}] {errorMessage}";
        var now = DateTimeOffset.UtcNow.ToString("O");

        // 1. Update UploadSession
        var updateSessionRequest = new UpdateItemRequest
        {
            TableName = _dynamoDbOptions.TableName,
            Key = new Dictionary<string, AttributeValue>
            {
                [DynamoAttributes.PartitionKey] = new() { S = UploadSessionKeys.PartitionKey(videoId) },
                [DynamoAttributes.SortKey] = new() { S = UploadSessionKeys.SortKeyTag }
            },
            UpdateExpression = "SET #transcodeStatus = :error, #completedAt = :completedAt, #errorMsg = :errorMsg",
            ExpressionAttributeNames = new Dictionary<string, string>
            {
                ["#transcodeStatus"] = UploadSessionAttributes.TranscodeStatus,
                ["#completedAt"] = UploadSessionAttributes.TranscodeCompletedAt,
                ["#errorMsg"] = UploadSessionAttributes.TranscodeErrorMessage
            },
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                [":error"] = new() { S = TranscodeStatuses.Error },
                [":completedAt"] = new() { S = now },
                [":errorMsg"] = new() { S = fullError ?? "Unknown error" }
            }
        };

        await _dynamoDb.UpdateItemAsync(updateSessionRequest, cancellationToken);

        // 2. Update Video status if exists
        var updateVideoRequest = new UpdateItemRequest
        {
            TableName = _dynamoDbOptions.TableName,
            Key = new Dictionary<string, AttributeValue>
            {
                [DynamoAttributes.PartitionKey] = new() { S = VideoKeys.PartitionKey(videoId) },
                [DynamoAttributes.SortKey] = new() { S = VideoKeys.SortKey(videoId) }
            },
            UpdateExpression = "SET #videoId = :videoId, #status = :error, #updatedAt = :now, #createdAt = if_not_exists(#createdAt, :now)",
            ExpressionAttributeNames = new Dictionary<string, string>
            {
                ["#videoId"] = VideoAttributes.VideoId,
                ["#status"] = VideoAttributes.Status,
                ["#updatedAt"] = VideoAttributes.UpdatedAt,
                ["#createdAt"] = VideoAttributes.CreatedAt
            },
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                [":videoId"] = new() { S = videoId },
                [":error"] = new() { S = VideoStatuses.Error },
                [":now"] = new() { S = now }
            }
        };

        await _dynamoDb.UpdateItemAsync(updateVideoRequest, cancellationToken);

        _logger.LogError(
            "Marked video {VideoId} as ERROR for transcode job {JobId}. Error: {Error}.",
            videoId,
            jobId,
            fullError);
    }

    private static string? ExtractVideoId(JsonElement detail)
    {
        // 1. Try UserMetadata
        if (detail.TryGetProperty("userMetadata", out var userMetadata) &&
            userMetadata.ValueKind == JsonValueKind.Object &&
            userMetadata.TryGetProperty("videoId", out var videoIdProp))
        {
            var vid = videoIdProp.GetString();
            if (!string.IsNullOrWhiteSpace(vid)) return vid;
        }

        // 2. Try parsing paths in outputGroupDetails
        if (detail.TryGetProperty("outputGroupDetails", out var outputGroups) &&
            outputGroups.ValueKind == JsonValueKind.Array)
        {
            foreach (var group in outputGroups.EnumerateArray())
            {
                if (group.TryGetProperty("playlistFilePaths", out var playlists) &&
                    playlists.ValueKind == JsonValueKind.Array)
                {
                    foreach (var playlist in playlists.EnumerateArray())
                    {
                        var path = playlist.GetString();
                        if (path != null)
                        {
                            var match = HlsPathRegex().Match(path);
                            if (match.Success) return match.Groups[1].Value;
                        }
                    }
                }

                if (group.TryGetProperty("outputDetails", out var outputDetails) &&
                    outputDetails.ValueKind == JsonValueKind.Array)
                {
                    foreach (var outDetail in outputDetails.EnumerateArray())
                    {
                        if (outDetail.TryGetProperty("outputFilePaths", out var outputFiles) &&
                            outputFiles.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var outFile in outputFiles.EnumerateArray())
                            {
                                var path = outFile.GetString();
                                if (path != null)
                                {
                                    var match = HlsPathRegex().Match(path);
                                    if (match.Success) return match.Groups[1].Value;
                                }
                            }
                        }
                    }
                }
            }
        }

        return null;
    }

    private static long ExtractDurationMs(JsonElement detail)
    {
        if (!detail.TryGetProperty("outputGroupDetails", out var outputGroups) ||
            outputGroups.ValueKind != JsonValueKind.Array)
        {
            return 0;
        }

        foreach (var group in outputGroups.EnumerateArray())
        {
            if (group.TryGetProperty("outputDetails", out var outputDetails) &&
                outputDetails.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in outputDetails.EnumerateArray())
                {
                    if (item.TryGetProperty("durationInMs", out var durationProp) &&
                        durationProp.TryGetInt64(out var durationMs) &&
                        durationMs > 0)
                    {
                        return durationMs;
                    }
                }
            }
        }

        return 0;
    }

    private string BuildPlaybackUrl(string videoId, JsonElement detail)
    {
        var relativePath = $"hls/{videoId}/index.m3u8";

        if (!string.IsNullOrWhiteSpace(_storageOptions.CdnBaseUrl))
        {
            return $"{_storageOptions.CdnBaseUrl.TrimEnd('/')}/{relativePath}";
        }

        if (!string.IsNullOrWhiteSpace(_storageOptions.ProcessedBucketName))
        {
            return $"https://{_storageOptions.ProcessedBucketName}.s3.amazonaws.com/{relativePath}";
        }

        return $"/{relativePath}";
    }

    private string BuildThumbnailUrl(string videoId)
    {
        var relativePath = $"thumbnails/{videoId}/thumb.0000000.jpg";

        if (!string.IsNullOrWhiteSpace(_storageOptions.CdnBaseUrl))
        {
            return $"{_storageOptions.CdnBaseUrl.TrimEnd('/')}/{relativePath}";
        }

        if (!string.IsNullOrWhiteSpace(_storageOptions.ProcessedBucketName))
        {
            return $"https://{_storageOptions.ProcessedBucketName}.s3.amazonaws.com/{relativePath}";
        }

        return $"/{relativePath}";
    }

    [GeneratedRegex(@"/hls/([^/]+)/")]
    private static partial Regex HlsPathRegex();
}
