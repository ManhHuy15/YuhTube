namespace YuhTube.Video.Api.Dtos;

public sealed record VideoCommentDto(
    string Id,
    string Content,
    string UserId,
    string UserName,
    string? UserAvatar,
    string CreatedAt
);

public sealed record VideoDetailResponse(
    string Id,
    string Title,
    string Description,
    string? PlaybackUrl,
    string? ThumbnailUrl,
    long DurationMs,
    bool IsPrivate,
    string Status,
    string CreatedAt,
    string UpdatedAt,
    int LikesCount,
    UploaderDto Uploader,
    IReadOnlyList<VideoCommentDto> Comments
);
