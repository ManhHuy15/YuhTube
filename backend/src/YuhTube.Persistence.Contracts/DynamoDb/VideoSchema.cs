namespace YuhTube.Persistence.Contracts.DynamoDb;

public static class VideoKeys
{
    public const string PartitionKeyPrefix = "VIDEO#";
    public const string SortKeyPrefix = "META#";

    public static string PartitionKey(string videoId) => $"{PartitionKeyPrefix}{videoId}";
    public static string SortKey(string videoId) => $"{SortKeyPrefix}{videoId}";
}

public static class CommentKeys
{
    public const string SortKeyPrefix = "COMMENT#";

    public static string SortKey(string commentId) => $"{SortKeyPrefix}{commentId}";
}

public static class LikeKeys
{
    public const string SortKeyPrefix = "LIKE#";

    public static string SortKey(string userId) => $"{SortKeyPrefix}{userId}";
}

public static class VideoAttributes
{
    public const string VideoId = "VideoId";
    public const string Title = "Title";
    public const string Description = "Description";
    public const string ThumbnailUrl = "ThumbnailUrl";
    public const string PlaybackUrl = "PlaybackUrl";
    public const string Status = "Status";
    public const string DurationMs = "DurationMs";
    public const string IsPrivate = "IsPrivate";
    public const string UploaderId = "UploaderId";
    public const string UploaderName = "UploaderName";
    public const string UploaderAvatar = "UploaderAvatar";
    public const string CreatedAt = "CreatedAt";
    public const string UpdatedAt = "UpdatedAt";

    // Global Secondary Index 1 (GSI1) for Channel/Uploader querying
    public const string Gsi1PartitionKey = "GSI1_PK";
    public const string Gsi1SortKey = "GSI1_SK";

    // Global Secondary Index 2 (GSI2) for Platform Home Feed querying
    public const string Gsi2PartitionKey = "GSI2_PK";
    public const string Gsi2SortKey = "GSI2_SK";
    public const string FeedPartitionTag = "VIDEO";
}

public static class VideoStatuses
{
    public const string Processing = "PROCESSING";
    public const string Ready = "READY";
    public const string Error = "ERROR";
}
