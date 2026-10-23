using Amazon.Lambda.Core;
using Amazon.Lambda.S3Events;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace YuhTube.MediaConvertCoordinator;

public sealed class Function
{
    public Task FunctionHandler(S3Event input, ILambdaContext context) => Task.CompletedTask;
}
