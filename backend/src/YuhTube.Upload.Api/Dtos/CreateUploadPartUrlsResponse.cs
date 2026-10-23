namespace YuhTube.Upload.Api.Dtos;

public sealed record CreateUploadPartUrlsResponse(
    DateTime ExpiresAt,
    IReadOnlyList<UploadPartUrl> Parts);

public sealed record UploadPartUrl(int PartNumber, string Url);
