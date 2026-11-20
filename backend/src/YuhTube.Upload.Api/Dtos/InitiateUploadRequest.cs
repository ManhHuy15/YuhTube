using System.ComponentModel.DataAnnotations;

namespace YuhTube.Upload.Api.Dtos;

public sealed record InitiateUploadRequest(
    [Required, StringLength(255)] string FileName,
    [Required, StringLength(100)] string ContentType,
    [Range(1, long.MaxValue)] long FileSizeBytes,
    [StringLength(200)] string? Title = null,
    [StringLength(5000)] string? Description = null);
