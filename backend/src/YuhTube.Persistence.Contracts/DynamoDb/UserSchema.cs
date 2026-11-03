namespace YuhTube.Persistence.Contracts.DynamoDb;

public static class UserAttributes
{
    public const string UserId = "UserId";
    public const string ChannelName = "ChannelName";
    public const string Email = "Email";
    public const string AvatarUrl = "AvatarUrl";
    public const string CreatedAt = "CreatedAt";
    public const string UpdatedAt = "UpdatedAt";
}

public static class UserKeys
{
    public const string PartitionKeyPrefix = "USER#";
    public const string SortKeyPrefix = "PROFILE#";

    public static string PartitionKey(string userId) => $"{PartitionKeyPrefix}{userId}";
    public static string SortKey(string userId) => $"{SortKeyPrefix}{userId}";
}
