using System.ComponentModel.DataAnnotations;

namespace YuhTube.Video.Api.Dtos;

public sealed record UpdateVideoMetadataRequest(
    [Required]
    [StringLength(200, MinimumLength = 1, ErrorMessage = "Title must be between 1 and 200 characters.")]
    string Title,

    [StringLength(5000, ErrorMessage = "Description cannot exceed 5000 characters.")]
    string? Description = null,

    string? ThumbnailUrl = null,

    bool? IsPrivate = null
);
