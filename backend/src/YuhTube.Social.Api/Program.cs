using Amazon.DynamoDBv2;
using Amazon.Extensions.Configuration.SystemsManager;
using Amazon.Lambda.AspNetCoreServer.Hosting;
using YuhTube.Social.Api.Configuration;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddSystemsManager("/yuhtube/");

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);
builder.Services.AddSingleton<IAmazonDynamoDB, AmazonDynamoDBClient>();
builder.Services.AddOptions<DynamoDbOptions>()
    .BindConfiguration(DynamoDbOptions.SectionName)
    .Validate(options => !string.IsNullOrWhiteSpace(options.TableName),
        "DynamoDb:TableName is required.")
    .ValidateOnStart();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
