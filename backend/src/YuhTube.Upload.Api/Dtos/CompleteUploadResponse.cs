namespace YuhTube.Upload.Api.Dtos;

public sealed record CompleteUploadResponse(
    string VideoId,
    string ObjectKey,
    string ETag);
