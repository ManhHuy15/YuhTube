using System.Net;
using Amazon.DynamoDBv2;
using Amazon.Extensions.Configuration.SystemsManager;
using Amazon.Lambda.Core;
using Amazon.Lambda.S3Events;
using Amazon.MediaConvert;
using Amazon.MediaConvert.Model;
using Microsoft.Extensions.Configuration;
using YuhTube.MediaConvertCoordinator.Configuration;
using YuhTube.MediaConvertCoordinator.Services;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace YuhTube.MediaConvertCoordinator;

public sealed class Function
{
    private static readonly IAmazonDynamoDB DynamoDb = new AmazonDynamoDBClient();
    private static readonly IAmazonMediaConvert MediaConvert = new AmazonMediaConvertClient();
    private readonly MediaConvertJobService _mediaConvertJobService;
    private readonly string _rawBucketName;

    public Function()
    {
        var configuration = new ConfigurationBuilder()
            .AddSystemsManager("/yuhtube/", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var dynamoDbOptions = new DynamoDbOptions
        {
            TableName = Required(configuration, "DynamoDb:TableName")
        };
        var storageOptions = new StorageOptions
        {
            RawBucketName = Required(configuration, "Storage:RawBucketName"),
            ProcessedBucketName = Required(configuration, "Storage:ProcessedBucketName")
        };
        var mediaConvertOptions = new MediaConvertOptions
        {
            RoleArn = Required(configuration, "MediaConvert:RoleArn")
        };

        _rawBucketName = storageOptions.RawBucketName;
        _mediaConvertJobService = new MediaConvertJobService(
            DynamoDb,
            MediaConvert,
            dynamoDbOptions,
            storageOptions,
            mediaConvertOptions);
    }

    public async Task FunctionHandler(S3Event input, ILambdaContext context)
    {
        foreach (var record in input.Records)
        {
            var objectKey = WebUtility.UrlDecode(record.S3.Object.Key.Replace('+', ' '));
            if (record.S3.Bucket.Name != _rawBucketName || !TryGetVideoId(objectKey, out var videoId))
            {
                context.Logger.LogInformation($"Skipped S3 event for {record.S3.Bucket.Name}/{objectKey}.");
                continue;
            }

            var result = await _mediaConvertJobService.CreateJobAsync(videoId, objectKey, CancellationToken.None);
            switch (result)
            {
                case CreateJobResult.Submitted:
                    context.Logger.LogInformation($"Submitted MediaConvert job for {videoId}.");
                    break;
                case CreateJobResult.AlreadySubmitted:
                    context.Logger.LogInformation($"MediaConvert job already exists for {videoId}.");
                    break;
                case CreateJobResult.InvalidUpload:
                    context.Logger.LogWarning($"Skipped unrecognized upload object {objectKey}.");
                    break;
            }
        }
    }

    private static bool TryGetVideoId(string objectKey, out string videoId)
    {
        videoId = string.Empty;
        var segments = objectKey.Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (segments.Length != 3 || segments[0] != "raw" || !segments[2].StartsWith("source.", StringComparison.Ordinal))
        {
            return false;
        }

        videoId = segments[1];
        return true;
    }

    private static string Required(IConfiguration configuration, string key) =>
        configuration[key] ?? throw new InvalidOperationException($"{key} is not configured.");
}
