namespace YuhTube.Video.Api.Dtos;

public sealed record VideoFeedItemDto(
    string Id,
    string Title,
    string? ThumbnailUrl,
    long DurationMs,
    bool IsPrivate,
    string Status,
    string CreatedAt,
    UploaderDto Uploader
);
