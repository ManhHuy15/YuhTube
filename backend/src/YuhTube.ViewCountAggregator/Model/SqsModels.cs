using System.Text.Json.Serialization;

namespace YuhTube.ViewCountAggregator.Model;

public sealed class SqsEvent
{
    [JsonPropertyName("Records")]
    public List<SqsRecord> Records { get; set; } = [];
}

public sealed class SqsRecord
{
    [JsonPropertyName("messageId")]
    public string MessageId { get; set; } = string.Empty;

    [JsonPropertyName("receiptHandle")]
    public string ReceiptHandle { get; set; } = string.Empty;

    [JsonPropertyName("body")]
    public string Body { get; set; } = string.Empty;

    [JsonPropertyName("attributes")]
    public Dictionary<string, string>? Attributes { get; set; }

    [JsonPropertyName("eventSource")]
    public string? EventSource { get; set; }

    [JsonPropertyName("eventSourceARN")]
    public string? EventSourceArn { get; set; }
}

public sealed class SqsBatchResponse
{
    [JsonPropertyName("batchItemFailures")]
    public List<BatchItemFailure> BatchItemFailures { get; set; } = [];

    public sealed class BatchItemFailure
    {
        [JsonPropertyName("itemIdentifier")]
        public string ItemIdentifier { get; set; } = string.Empty;
    }
}

public sealed class ViewMessagePayload
{
    [JsonPropertyName("videoId")]
    public string? VideoId { get; set; }

    [JsonPropertyName("timestamp")]
    public string? Timestamp { get; set; }

    [JsonPropertyName("viewerId")]
    public string? ViewerId { get; set; }
}
