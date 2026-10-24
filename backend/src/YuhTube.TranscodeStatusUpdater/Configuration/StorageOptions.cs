namespace YuhTube.TranscodeStatusUpdater.Configuration;

public sealed class StorageOptions
{
    public const string SectionName = "Storage";
    public string ProcessedBucketName { get; init; } = string.Empty;
    public string? CdnBaseUrl { get; init; }
}
