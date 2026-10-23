using System.Text.Json;
using Amazon.Lambda.CloudWatchEvents;
using Amazon.Lambda.Core;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace YuhTube.TranscodeStatusUpdater;

public sealed class Function
{
    public Task FunctionHandler(CloudWatchEvent<JsonElement> input, ILambdaContext context) =>
        Task.CompletedTask;
}
