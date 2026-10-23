namespace YuhTube.MediaConvertCoordinator.Configuration;

public sealed class DynamoDbOptions
{
    public const string SectionName = "DynamoDb";
    public string TableName { get; init; } = string.Empty;
}

public sealed class StorageOptions
{
    public const string SectionName = "Storage";
    public string RawBucketName { get; init; } = string.Empty;
    public string ProcessedBucketName { get; init; } = string.Empty;
}

public sealed class MediaConvertOptions
{
    public const string SectionName = "MediaConvert";
    public string RoleArn { get; init; } = string.Empty;
}
