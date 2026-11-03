namespace YuhTube.Video.Api.Configuration;

public sealed class StorageOptions
{
    public const string SectionName = "Storage";

    public string RawBucketName { get; init; } = string.Empty;
    public string ProcessedBucketName { get; init; } = string.Empty;
    public string? CdnBaseUrl { get; init; }
}
