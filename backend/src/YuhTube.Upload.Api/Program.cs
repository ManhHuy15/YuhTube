using Amazon.Extensions.Configuration.SystemsManager;
using Amazon.Lambda.AspNetCoreServer.Hosting;
using Amazon.DynamoDBv2;
using Amazon.S3;
using YuhTube.Upload.Api.Configuration;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddSystemsManager("/yuhtube/");

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);
builder.Services.AddSingleton<IAmazonS3, AmazonS3Client>();
builder.Services.AddSingleton<IAmazonDynamoDB, AmazonDynamoDBClient>();
builder.Services.AddOptions<UploadOptions>()
    .BindConfiguration(UploadOptions.SectionName)
    .Validate(options => options.PartSizeMiB >= 5, "Upload:PartSizeMiB must be at least 5 MiB.")
    .Validate(options => options.PresignedUrlExpirationMinutes > 0,
        "Upload:PresignedUrlExpirationMinutes must be greater than zero.")
    .ValidateOnStart();
builder.Services.AddOptions<StorageOptions>()
    .BindConfiguration(StorageOptions.SectionName)
    .Validate(options => !string.IsNullOrWhiteSpace(options.RawBucketName),
        "Storage:RawBucketName is required.")
    .ValidateOnStart();
builder.Services.AddOptions<DynamoDbOptions>()
    .BindConfiguration(DynamoDbOptions.SectionName)
    .Validate(options => !string.IsNullOrWhiteSpace(options.TableName),
        "DynamoDb:TableName is required.")
    .ValidateOnStart();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
