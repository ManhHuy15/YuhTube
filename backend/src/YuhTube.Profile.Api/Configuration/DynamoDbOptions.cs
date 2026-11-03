namespace YuhTube.Profile.Api.Configuration;

public sealed class DynamoDbOptions
{
    public const string SectionName = "DynamoDb";

    public string TableName { get; init; } = string.Empty;
}
