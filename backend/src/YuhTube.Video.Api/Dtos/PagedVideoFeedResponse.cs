namespace YuhTube.Video.Api.Dtos;

public sealed record PagedVideoFeedResponse(
    IReadOnlyList<VideoFeedItemDto> Items,
    string? NextCursor
);

