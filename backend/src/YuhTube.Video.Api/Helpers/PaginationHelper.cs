using System.Text;
using System.Text.Json;
using Amazon.DynamoDBv2.Model;

namespace YuhTube.Video.Api.Helpers;

public static class PaginationHelper
{
    public static string? EncodeCursor(Dictionary<string, AttributeValue>? lastEvaluatedKey)
    {
        if (lastEvaluatedKey == null || lastEvaluatedKey.Count == 0)
        {
            return null;
        }

        var simplified = new Dictionary<string, (string? S, string? N)>(lastEvaluatedKey.Count);
        foreach (var (key, value) in lastEvaluatedKey)
        {
            simplified[key] = (value.S, value.N);
        }

        var json = JsonSerializer.Serialize(simplified);
        return Convert.ToBase64String(Encoding.UTF8.GetBytes(json));
    }

    public static Dictionary<string, AttributeValue>? DecodeCursor(string? cursor)
    {
        if (string.IsNullOrWhiteSpace(cursor))
        {
            return null;
        }

        try
        {
            var json = Encoding.UTF8.GetString(Convert.FromBase64String(cursor));
            var dictionary = JsonSerializer.Deserialize<Dictionary<string, AttributeValueStub>>(json);
            if (dictionary == null || dictionary.Count == 0)
            {
                return null;
            }

            var result = new Dictionary<string, AttributeValue>(dictionary.Count);
            foreach (var (key, stub) in dictionary)
            {
                var attr = new AttributeValue();
                if (!string.IsNullOrEmpty(stub.S))
                {
                    attr.S = stub.S;
                }
                else if (!string.IsNullOrEmpty(stub.N))
                {
                    attr.N = stub.N;
                }
                result[key] = attr;
            }

            return result;
        }
        catch
        {
            return null;
        }
    }

    private sealed class AttributeValueStub
    {
        public string? S { get; set; }
        public string? N { get; set; }
    }
}

