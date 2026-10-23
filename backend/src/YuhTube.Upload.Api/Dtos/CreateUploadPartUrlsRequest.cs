using System.ComponentModel.DataAnnotations;

namespace YuhTube.Upload.Api.Dtos;

public sealed record CreateUploadPartUrlsRequest(
    [Required, MinLength(1)] int[] PartNumbers);
