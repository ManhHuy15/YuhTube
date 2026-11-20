namespace YuhTube.Upload.Api.Dtos;

public sealed record UploadedPartsResponse(
    string VideoId,
    string Status,
    long PartSizeBytes,
    int PartCount,
    IReadOnlyList<CompleteUploadPart> UploadedParts
);
