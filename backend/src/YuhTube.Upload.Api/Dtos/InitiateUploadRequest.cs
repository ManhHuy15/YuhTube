using System.ComponentModel.DataAnnotations;

namespace YuhTube.Upload.Api.Dtos;

public sealed record InitiateUploadRequest(
    [Required, StringLength(255)] string FileName,
    [Required, StringLength(100)] string ContentType,
    [Range(1, long.MaxValue)] long FileSizeBytes);
