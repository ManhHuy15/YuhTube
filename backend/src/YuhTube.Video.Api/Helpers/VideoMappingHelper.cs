using Amazon.DynamoDBv2.Model;
using YuhTube.Persistence.Contracts.DynamoDb;
using YuhTube.Video.Api.Dtos;

namespace YuhTube.Video.Api.Helpers;

public static class VideoMappingHelper
{
    public static VideoFeedItemDto MapFeedItem(Dictionary<string, AttributeValue> item)
    {
        var videoId = GetString(item, VideoAttributes.VideoId, string.Empty);
        var title = GetString(item, VideoAttributes.Title, string.Empty);
        var thumbnailUrl = GetNullableString(item, VideoAttributes.ThumbnailUrl);
        var durationMs = GetLong(item, VideoAttributes.DurationMs, 0L);
        var isPrivate = GetBool(item, VideoAttributes.IsPrivate, false);
        var status = GetString(item, VideoAttributes.Status, VideoStatuses.Processing);
        var createdAt = GetString(item, VideoAttributes.CreatedAt, string.Empty);

        var uploaderId = GetString(item, VideoAttributes.UploaderId, string.Empty);
        var uploaderName = GetString(item, VideoAttributes.UploaderName, string.Empty);
        var uploaderAvatar = GetNullableString(item, VideoAttributes.UploaderAvatar);

        return new VideoFeedItemDto(
            Id: videoId,
            Title: title,
            ThumbnailUrl: thumbnailUrl,
            DurationMs: durationMs,
            IsPrivate: isPrivate,
            Status: status,
            CreatedAt: createdAt,
            Uploader: new UploaderDto(uploaderId, uploaderName, uploaderAvatar)
        );
    }

    public static VideoDetailResponse MapDetail(
        string videoId,
        Dictionary<string, AttributeValue> metaItem,
        int likesCount,
        IReadOnlyList<VideoCommentDto> comments)
    {
        var title = GetString(metaItem, VideoAttributes.Title, string.Empty);
        var description = GetString(metaItem, VideoAttributes.Description, string.Empty);
        var playbackUrl = GetNullableString(metaItem, VideoAttributes.PlaybackUrl);
        var thumbnailUrl = GetNullableString(metaItem, VideoAttributes.ThumbnailUrl);
        var durationMs = GetLong(metaItem, VideoAttributes.DurationMs, 0L);
        var isPrivate = GetBool(metaItem, VideoAttributes.IsPrivate, false);
        var status = GetString(metaItem, VideoAttributes.Status, VideoStatuses.Processing);
        var createdAt = GetString(metaItem, VideoAttributes.CreatedAt, string.Empty);
        var updatedAt = GetString(metaItem, VideoAttributes.UpdatedAt, string.Empty);

        var uploaderId = GetString(metaItem, VideoAttributes.UploaderId, string.Empty);
        var uploaderName = GetString(metaItem, VideoAttributes.UploaderName, string.Empty);
        var uploaderAvatar = GetNullableString(metaItem, VideoAttributes.UploaderAvatar);

        return new VideoDetailResponse(
            Id: videoId,
            Title: title,
            Description: description,
            PlaybackUrl: playbackUrl,
            ThumbnailUrl: thumbnailUrl,
            DurationMs: durationMs,
            IsPrivate: isPrivate,
            Status: status,
            CreatedAt: createdAt,
            UpdatedAt: updatedAt,
            LikesCount: likesCount,
            Uploader: new UploaderDto(uploaderId, uploaderName, uploaderAvatar),
            Comments: comments
        );
    }

    public static string GetString(Dictionary<string, AttributeValue> item, string key, string fallback) =>
        item.TryGetValue(key, out var attr) && !string.IsNullOrEmpty(attr.S) ? attr.S : fallback;

    public static string? GetNullableString(Dictionary<string, AttributeValue> item, string key) =>
        item.TryGetValue(key, out var attr) && !string.IsNullOrEmpty(attr.S) ? attr.S : null;

    public static long GetLong(Dictionary<string, AttributeValue> item, string key, long fallback) =>
        item.TryGetValue(key, out var attr) && long.TryParse(attr.N, out var val) ? val : fallback;

    public static bool GetBool(Dictionary<string, AttributeValue> item, string key, bool fallback) =>
        item.TryGetValue(key, out var attr) && attr.BOOL.HasValue ? attr.BOOL.Value : fallback;
}

