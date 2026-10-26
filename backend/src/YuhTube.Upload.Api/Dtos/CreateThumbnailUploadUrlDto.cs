namespace YuhTube.Upload.Api.Dtos;

public sealed record CreateThumbnailUploadUrlRequest(
    string FileName,
    string ContentType);

public sealed record CreateThumbnailUploadUrlResponse(
    string UploadUrl,
    string PublicUrl,
    DateTime ExpiresAt);

