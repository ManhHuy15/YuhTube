namespace YuhTube.Upload.Api.Configuration;

public sealed class UploadOptions
{
    public const string SectionName = "Upload";

    public int PartSizeMiB { get; init; }
    public int PresignedUrlExpirationMinutes { get; init; }
}

public sealed class StorageOptions
{
    public const string SectionName = "Storage";

    public string RawBucketName { get; init; } = string.Empty;
}

public sealed class DynamoDbOptions
{
    public const string SectionName = "DynamoDb";

    public string TableName { get; init; } = string.Empty;
}
