using System.ComponentModel.DataAnnotations;

namespace YuhTube.Social.Api.Dtos;

public sealed record CreateCommentRequest(
    [Required(ErrorMessage = "Comment content cannot be empty.")]
    [StringLength(2000, MinimumLength = 1, ErrorMessage = "Comment must be between 1 and 2000 characters.")]
    string Content
);

public sealed record CommentResponseDto(
    string Id,
    string VideoId,
    string Content,
    string UserId,
    string UserName,
    string? UserAvatar,
    string CreatedAt
);
