using Amazon.Extensions.Configuration.SystemsManager;
using Amazon.Lambda.AspNetCoreServer.Hosting;
using Amazon.DynamoDBv2;
using Amazon.S3;
using YuhTube.Video.Api.Configuration;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddSystemsManager("/yuhtube/");

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);
builder.Services.AddSingleton<IAmazonDynamoDB, AmazonDynamoDBClient>();
builder.Services.AddSingleton<IAmazonS3, AmazonS3Client>();
builder.Services.AddOptions<DynamoDbOptions>()
    .BindConfiguration(DynamoDbOptions.SectionName)
    .Validate(options => !string.IsNullOrWhiteSpace(options.TableName),
        "DynamoDb:TableName is required.")
    .ValidateOnStart();
builder.Services.AddOptions<StorageOptions>()
    .BindConfiguration(StorageOptions.SectionName);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
