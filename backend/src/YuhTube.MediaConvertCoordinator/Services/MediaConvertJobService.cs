using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Amazon.MediaConvert;
using Amazon.MediaConvert.Model;
using YuhTube.MediaConvertCoordinator.Configuration;
using YuhTube.Persistence.Contracts.DynamoDb;

namespace YuhTube.MediaConvertCoordinator.Services;

public sealed class MediaConvertJobService
{
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly IAmazonMediaConvert _mediaConvert;
    private readonly DynamoDbOptions _dynamoDbOptions;
    private readonly StorageOptions _storageOptions;
    private readonly MediaConvertOptions _mediaConvertOptions;

    public MediaConvertJobService(
        IAmazonDynamoDB dynamoDb,
        IAmazonMediaConvert mediaConvert,
        DynamoDbOptions dynamoDbOptions,
        StorageOptions storageOptions,
        MediaConvertOptions mediaConvertOptions)
    {
        _dynamoDb = dynamoDb;
        _mediaConvert = mediaConvert;
        _dynamoDbOptions = dynamoDbOptions;
        _storageOptions = storageOptions;
        _mediaConvertOptions = mediaConvertOptions;
    }

    public async Task<CreateJobResult> CreateJobAsync(
        string videoId,
        string objectKey,
        CancellationToken cancellationToken)
    {
        var session = await _dynamoDb.GetItemAsync(new GetItemRequest
        {
            TableName = _dynamoDbOptions.TableName,
            ConsistentRead = true,
            Key = new Dictionary<string, AttributeValue>
            {
                [DynamoAttributes.PartitionKey] = new() { S = UploadSessionKeys.PartitionKey(videoId) },
                [DynamoAttributes.SortKey] = new() { S = UploadSessionKeys.SortKeyTag }
            }
        }, cancellationToken);

        if (session.Item.Count == 0 ||
            session.Item[UploadSessionAttributes.Status].S != UploadSessionStatuses.Completed ||
            session.Item[UploadSessionAttributes.ObjectKey].S != objectKey)
        {
            return CreateJobResult.InvalidUpload;
        }

        if (session.Item.ContainsKey(UploadSessionAttributes.MediaConvertJobId))
        {
            return CreateJobResult.AlreadySubmitted;
        }

        var job = await _mediaConvert.CreateJobAsync(new CreateJobRequest
        {
            ClientRequestToken = videoId,
            Role = _mediaConvertOptions.RoleArn,
            Settings = CreateHlsJobSettings(videoId, objectKey)
        }, cancellationToken);

        try
        {
            await _dynamoDb.UpdateItemAsync(new UpdateItemRequest
            {
                TableName = _dynamoDbOptions.TableName,
                Key = new Dictionary<string, AttributeValue>
                {
                    [DynamoAttributes.PartitionKey] = new() { S = UploadSessionKeys.PartitionKey(videoId) },
                    [DynamoAttributes.SortKey] = new() { S = UploadSessionKeys.SortKeyTag }
                },
                ConditionExpression = "attribute_not_exists(#jobId)",
                UpdateExpression = "SET #jobId = :jobId, #transcodeStatus = :transcodeStatus, #submittedAt = :submittedAt",
                ExpressionAttributeNames = new Dictionary<string, string>
                {
                    ["#jobId"] = UploadSessionAttributes.MediaConvertJobId,
                    ["#transcodeStatus"] = UploadSessionAttributes.TranscodeStatus,
                    ["#submittedAt"] = UploadSessionAttributes.TranscodeSubmittedAt
                },
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    [":jobId"] = new() { S = job.Job.Id },
                    [":transcodeStatus"] = new() { S = TranscodeStatuses.Submitted },
                    [":submittedAt"] = new() { S = DateTimeOffset.UtcNow.ToString("O") }
                }
            }, cancellationToken);
        }
        catch (ConditionalCheckFailedException)
        {
            return CreateJobResult.AlreadySubmitted;
        }

        return CreateJobResult.Submitted;
    }

    private JobSettings CreateHlsJobSettings(string videoId, string objectKey) => new()
    {
        Inputs = new List<Input>
        {
            new()
            {
                FileInput = $"s3://{_storageOptions.RawBucketName}/{objectKey}",
                AudioSelectors = new Dictionary<string, AudioSelector>
                {
                    ["Default"] = new() { DefaultSelection = AudioDefaultSelection.DEFAULT }
                }
            }
        },
        OutputGroups = new List<OutputGroup>
        {
            new()
            {
                OutputGroupSettings = new OutputGroupSettings
                {
                    Type = OutputGroupType.HLS_GROUP_SETTINGS,
                    HlsGroupSettings = new HlsGroupSettings
                    {
                        Destination = $"s3://{_storageOptions.ProcessedBucketName}/hls/{videoId}/index",
                        SegmentLength = 6,
                        MinSegmentLength = 0
                    }
                },
                Outputs = new List<Output>
                {
                    new()
                    {
                        NameModifier = "_720p",
                        ContainerSettings = new ContainerSettings { Container = ContainerType.M3U8 },
                        VideoDescription = new VideoDescription
                        {
                            Width = 1280,
                            Height = 720,
                            CodecSettings = new VideoCodecSettings
                            {
                                Codec = VideoCodec.H_264,
                                H264Settings = new H264Settings
                                {
                                    RateControlMode = H264RateControlMode.QVBR,
                                    MaxBitrate = 2_500_000,
                                    QvbrSettings = new H264QvbrSettings { QvbrQualityLevel = 7 }
                                }
                            }
                        },
                        AudioDescriptions = new List<AudioDescription>
                        {
                            new()
                            {
                                AudioSourceName = "Default",
                                CodecSettings = new AudioCodecSettings
                                {
                                    Codec = AudioCodec.AAC,
                                    AacSettings = new AacSettings
                                    {
                                        Bitrate = 96_000,
                                        CodingMode = AacCodingMode.CODING_MODE_2_0,
                                        SampleRate = 48_000
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };
}

