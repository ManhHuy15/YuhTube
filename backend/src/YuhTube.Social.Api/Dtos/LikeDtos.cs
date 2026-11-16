namespace YuhTube.Social.Api.Dtos;

public sealed record LikeStatusResponseDto(
    string VideoId,
    bool IsLiked,
    int LikesCount
);
