using Amazon.DynamoDBv2;
using Amazon.Extensions.Configuration.SystemsManager;
using Amazon.Lambda.Core;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using YuhTube.ViewCountAggregator.Configuration;
using YuhTube.ViewCountAggregator.Model;
using YuhTube.ViewCountAggregator.Services;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace YuhTube.ViewCountAggregator;

public sealed class Function
{
    private static readonly IAmazonDynamoDB DynamoDb = new AmazonDynamoDBClient();
    private readonly ViewCountAggregatorService _aggregatorService;

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

        var loggerFactory = LoggerFactory.Create(builder =>
        {
            builder.AddSimpleConsole(options =>
            {
                options.SingleLine = true;
                options.TimestampFormat = "yyyy-MM-ddTHH:mm:ssZ ";
            });
            builder.SetMinimumLevel(Microsoft.Extensions.Logging.LogLevel.Information);
        });

        var logger = loggerFactory.CreateLogger<ViewCountAggregatorService>();

        _aggregatorService = new ViewCountAggregatorService(
            DynamoDb,
            dynamoDbOptions,
            logger);
    }

    public Function(ViewCountAggregatorService aggregatorService)
    {
        _aggregatorService = aggregatorService;
    }

    public async Task<SqsBatchResponse> FunctionHandler(SqsEvent sqsEvent, ILambdaContext context)
    {
        context.Logger.LogInformation($"Received SQS batch with {sqsEvent?.Records?.Count ?? 0} records.");

        if (sqsEvent?.Records == null || sqsEvent.Records.Count == 0)
        {
            return new SqsBatchResponse();
        }

        return await _aggregatorService.ProcessBatchAsync(sqsEvent.Records, CancellationToken.None);
    }

    private static string Required(IConfiguration configuration, string key) =>
        configuration[key] ?? throw new InvalidOperationException($"{key} is not configured.");
}
