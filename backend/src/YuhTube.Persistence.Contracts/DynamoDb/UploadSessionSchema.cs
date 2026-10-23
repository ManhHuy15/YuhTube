namespace YuhTube.Persistence.Contracts.DynamoDb;

public static class DynamoAttributes
{
    public const string PartitionKey = "PK";
    public const string SortKey = "SK";
}

public static class UploadSessionAttributes
{
    public const string ObjectKey = "ObjectKey";
    public const string S3UploadId = "S3UploadId";
    public const string PartSizeBytes = "PartSizeBytes";
    public const string PartCount = "PartCount";
    public const string Status = "Status";
    public const string CreatedAt = "CreatedAt";
    public const string CompletedAt = "CompletedAt";
    public const string ObjectETag = "ObjectETag";
}

public static class UploadSessionKeys
{
    public const string PartitionKeyPrefix = "UPLOAD#";
    public const string SortKeyTag = "SESSION";

    public static string PartitionKey(string videoId) => $"{PartitionKeyPrefix}{videoId}";
}

public static class UploadSessionStatuses
{
    public const string Initiated = "Initiated";
    public const string Completed = "Completed";
}
