using System.Text.Json;
using Amazon.DynamoDBv2;
using Amazon.Extensions.Configuration.SystemsManager;
using Amazon.Lambda.CloudWatchEvents;
using Amazon.Lambda.Core;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using YuhTube.TranscodeStatusUpdater.Configuration;
using YuhTube.TranscodeStatusUpdater.Services;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace YuhTube.TranscodeStatusUpdater;

public sealed class Function
{
    private static readonly IAmazonDynamoDB DynamoDb = new AmazonDynamoDBClient();
    private readonly TranscodeStatusService _transcodeStatusService;

    public Function()
    {
        var configuration = new ConfigurationBuilder()
            .AddSystemsManager("/yuhtube/")
            .AddEnvironmentVariables()
            .Build();

        var dynamoDbOptions = new DynamoDbOptions
        {
            TableName = Required(configuration, "DynamoDb:TableName")
        };

        var storageOptions = new StorageOptions
        {
            ProcessedBucketName = configuration["Storage:ProcessedBucketName"] ?? string.Empty,
            CdnBaseUrl = configuration["Storage:CdnBaseUrl"]
        };

        var loggerFactory = LoggerFactory.Create(builder =>
        {
            builder.AddSimpleConsole(options =>
            {
                options.SingleLine = true;
                options.TimestampFormat = "yyyy-MM-ddTHH:mm:ssZ ";
            });
            builder.SetMinimumLevel(Microsoft.Extensions.Logging.LogLevel.Information);
        });

        var logger = loggerFactory.CreateLogger<TranscodeStatusService>();

        _transcodeStatusService = new TranscodeStatusService(
            DynamoDb,
            dynamoDbOptions,
            storageOptions,
            logger);
    }

    public Function(TranscodeStatusService transcodeStatusService)
    {
        _transcodeStatusService = transcodeStatusService;
    }

    public async Task FunctionHandler(CloudWatchEvent<JsonElement> input, ILambdaContext context)
    {
        context.Logger.LogInformation($"Received CloudWatch Event ID: {input.Id}, Source: {input.Source}, DetailType: {input.DetailType}");

        var result = await _transcodeStatusService.ProcessEventAsync(input.Detail, CancellationToken.None);

        context.Logger.LogInformation($"Processed transcode event with result: {result}");
    }

    private static string Required(IConfiguration configuration, string key) =>
        configuration[key] ?? throw new InvalidOperationException($"{key} is not configured.");
}
