namespace YuhTube.Upload.Api.Dtos;

public sealed record InitiateUploadResponse(
    string VideoId,
    string UploadId,
    string ObjectKey,
    long PartSizeBytes,
    int PartCount);
