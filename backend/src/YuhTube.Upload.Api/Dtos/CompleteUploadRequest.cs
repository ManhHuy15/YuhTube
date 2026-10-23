using System.ComponentModel.DataAnnotations;

namespace YuhTube.Upload.Api.Dtos;

public sealed record CompleteUploadRequest(
    [Required, MinLength(1)] CompleteUploadPart[] Parts);

public sealed record CompleteUploadPart(
    [Range(1, 10_000)] int PartNumber,
    [Required] string ETag);
