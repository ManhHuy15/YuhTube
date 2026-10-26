using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Amazon.S3;
using Amazon.S3.Model;
using KsuidDotNet;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using YuhTube.Persistence.Contracts.DynamoDb;
using YuhTube.Upload.Api.Configuration;
using YuhTube.Upload.Api.Dtos;

namespace YuhTube.Upload.Api.Controllers;

[ApiController]
[Route("uploads")]
public sealed class UploadsController : ControllerBase
{
    private const long Mebibyte = 1024 * 1024;
    private const int MaximumPartCount = 10_000;
    private const int MaximumUrlsPerRequest = 100;
    private const long MaximumPartSizeBytes = 5L * 1024 * 1024 * 1024;
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly IAmazonS3 _s3;
    private readonly DynamoDbOptions _dynamoDbOptions;
    private readonly UploadOptions _uploadOptions;
    private readonly StorageOptions _storageOptions;
    private readonly ILogger<UploadsController> _logger;

    public UploadsController(
        IAmazonDynamoDB dynamoDb,
        IAmazonS3 s3,
        IOptions<DynamoDbOptions> dynamoDbOptions,
        IOptions<UploadOptions> uploadOptions,
        IOptions<StorageOptions> storageOptions,
        ILogger<UploadsController> logger)
    {
        _dynamoDb = dynamoDb;
        _s3 = s3;
        _dynamoDbOptions = dynamoDbOptions.Value;
        _uploadOptions = uploadOptions.Value;
        _storageOptions = storageOptions.Value;
        _logger = logger;
    }

    [HttpPost]
    [ProducesResponseType<InitiateUploadResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<InitiateUploadResponse>> Initiate(
        InitiateUploadRequest request,
        CancellationToken cancellationToken)
    {
        if (!request.ContentType.StartsWith("video/", StringComparison.OrdinalIgnoreCase))
        {
            ModelState.AddModelError(nameof(request.ContentType), "ContentType must be a video MIME type.");
        }

        var extension = Path.GetExtension(request.FileName).ToLowerInvariant();
        if (extension.Length > 10 || extension.Skip(1).Any(character => !char.IsAsciiLetterOrDigit(character)))
        {
            ModelState.AddModelError(nameof(request.FileName), "File extension is invalid.");
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var minimumPartSizeBytes = _uploadOptions.PartSizeMiB * Mebibyte;
        var requiredPartSizeBytes = (request.FileSizeBytes - 1) / MaximumPartCount + 1;
        var partSizeBytes = Math.Max(minimumPartSizeBytes, requiredPartSizeBytes);
        if (partSizeBytes > MaximumPartSizeBytes) //chặn vượt 5 GiB/part
        {
            ModelState.AddModelError(nameof(request.FileSizeBytes), "File exceeds the S3 multipart upload limit.");
            return ValidationProblem(ModelState);
        }

        var partCount = (request.FileSizeBytes - 1) / partSizeBytes + 1;

        var videoId = Ksuid.NewKsuid();
        var objectKey = $"raw/{videoId}/source{extension}";
        _logger.LogInformation(
            "Initiating multipart upload to S3 bucket >{BucketName}< (length: {BucketNameLength})",
            _storageOptions.RawBucketName,
            _storageOptions.RawBucketName.Length);

        var result = await _s3.InitiateMultipartUploadAsync(new InitiateMultipartUploadRequest
        {
            BucketName = _storageOptions.RawBucketName,
            Key = objectKey,
            ContentType = request.ContentType
        }, cancellationToken);

        try
        {
            await _dynamoDb.PutItemAsync(new PutItemRequest
            {
                TableName = _dynamoDbOptions.TableName,
                ConditionExpression = $"attribute_not_exists({DynamoAttributes.PartitionKey})",
                Item = new Dictionary<string, AttributeValue>
                {
                    [DynamoAttributes.PartitionKey] = new() { S = UploadSessionKeys.PartitionKey(videoId) },
                    [DynamoAttributes.SortKey] = new() { S = UploadSessionKeys.SortKeyTag },
                    [UploadSessionAttributes.ObjectKey] = new() { S = objectKey },
                    [UploadSessionAttributes.S3UploadId] = new() { S = result.UploadId },
                    [UploadSessionAttributes.PartSizeBytes] = new() { N = partSizeBytes.ToString() },
                    [UploadSessionAttributes.PartCount] = new() { N = partCount.ToString() },
                    [UploadSessionAttributes.Status] = new() { S = UploadSessionStatuses.Initiated },
                    [UploadSessionAttributes.CreatedAt] = new() { S = DateTimeOffset.UtcNow.ToString("O") }
                }
            }, cancellationToken);
        }
        catch
        {
            try
            {
                await _s3.AbortMultipartUploadAsync(new AbortMultipartUploadRequest
                {
                    BucketName = _storageOptions.RawBucketName,
                    Key = objectKey,
                    UploadId = result.UploadId
                }, CancellationToken.None);
            }
            catch (Exception abortException)
            {
                _logger.LogWarning(abortException, "Failed to abort multipart upload {UploadId}.", result.UploadId);
            }

            throw;
        }

        var response = new InitiateUploadResponse(
            videoId,
            result.UploadId,
            objectKey,
            partSizeBytes,
            checked((int)partCount));

        return Created($"/uploads/{videoId}", response);
    }

    [HttpPost("{videoId}/parts")]
    [ProducesResponseType<CreateUploadPartUrlsResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CreateUploadPartUrlsResponse>> CreatePartUrls(
        string videoId,
        CreateUploadPartUrlsRequest request,
        CancellationToken cancellationToken)
    {
        if (request.PartNumbers.Length > MaximumUrlsPerRequest)
        {
            ModelState.AddModelError(nameof(request.PartNumbers), $"A maximum of {MaximumUrlsPerRequest} URLs can be requested at once.");
            return ValidationProblem(ModelState);
        }

        var sessionResult = await GetUploadSession(videoId, cancellationToken);

        if (sessionResult.Item.Count == 0 ||
            sessionResult.Item[UploadSessionAttributes.Status].S != UploadSessionStatuses.Initiated)
        {
            return NotFound();
        }

        var partCount = int.Parse(sessionResult.Item[UploadSessionAttributes.PartCount].N);
        if (request.PartNumbers.Distinct().Count() != request.PartNumbers.Length ||
            request.PartNumbers.Any(partNumber => partNumber < 1 || partNumber > partCount))
        {
            ModelState.AddModelError(nameof(request.PartNumbers), $"Part numbers must be unique and between 1 and {partCount}.");
            return ValidationProblem(ModelState);
        }

        var expiresAt = DateTime.UtcNow.AddMinutes(_uploadOptions.PresignedUrlExpirationMinutes);
        var urls = new List<UploadPartUrl>(request.PartNumbers.Length);
        foreach (var partNumber in request.PartNumbers)
        {
            var url = await _s3.GetPreSignedURLAsync(new GetPreSignedUrlRequest
            {
                BucketName = _storageOptions.RawBucketName,
                Key = sessionResult.Item[UploadSessionAttributes.ObjectKey].S,
                UploadId = sessionResult.Item[UploadSessionAttributes.S3UploadId].S,
                PartNumber = partNumber,
                Verb = HttpVerb.PUT,
                Expires = expiresAt
            });
            urls.Add(new UploadPartUrl(partNumber, url));
        }

        return Ok(new CreateUploadPartUrlsResponse(expiresAt, urls));
    }

    [HttpPost("{videoId}/complete")]
    [ProducesResponseType<CompleteUploadResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<CompleteUploadResponse>> Complete(
        string videoId,
        CompleteUploadRequest request,
        CancellationToken cancellationToken)
    {
        var sessionResult = await GetUploadSession(videoId, cancellationToken);
        if (sessionResult.Item.Count == 0)
        {
            return NotFound();
        }

        var status = sessionResult.Item[UploadSessionAttributes.Status].S;
        var objectKey = sessionResult.Item[UploadSessionAttributes.ObjectKey].S;
        if (status == UploadSessionStatuses.Completed)
        {
            return Ok(new CompleteUploadResponse(
                videoId,
                objectKey,
                sessionResult.Item[UploadSessionAttributes.ObjectETag].S));
        }

        if (status != UploadSessionStatuses.Initiated)
        {
            return Conflict();
        }

        var expectedPartCount = int.Parse(sessionResult.Item[UploadSessionAttributes.PartCount].N);
        if (request.Parts.Length != expectedPartCount ||
            request.Parts.Select(part => part.PartNumber).Distinct().Count() != expectedPartCount ||
            request.Parts.Any(part => part.PartNumber < 1 || part.PartNumber > expectedPartCount))
        {
            ModelState.AddModelError(nameof(request.Parts), $"Exactly {expectedPartCount} unique parts are required.");
            return ValidationProblem(ModelState);
        }

        var result = await _s3.CompleteMultipartUploadAsync(new CompleteMultipartUploadRequest
        {
            BucketName = _storageOptions.RawBucketName,
            Key = objectKey,
            UploadId = sessionResult.Item[UploadSessionAttributes.S3UploadId].S,
            PartETags = request.Parts
                .OrderBy(part => part.PartNumber)
                .Select(part => new PartETag(part.PartNumber, part.ETag))
                .ToList()
        }, cancellationToken);

        await _dynamoDb.UpdateItemAsync(new UpdateItemRequest
        {
            TableName = _dynamoDbOptions.TableName,
            Key = new Dictionary<string, AttributeValue>
            {
                [DynamoAttributes.PartitionKey] = new() { S = UploadSessionKeys.PartitionKey(videoId) },
                [DynamoAttributes.SortKey] = new() { S = UploadSessionKeys.SortKeyTag }
            },
            UpdateExpression = "SET #status = :completed, #completedAt = :completedAt, #objectETag = :objectETag",
            ConditionExpression = "#status = :initiated",
            ExpressionAttributeNames = new Dictionary<string, string>
            {
                ["#status"] = UploadSessionAttributes.Status,
                ["#completedAt"] = UploadSessionAttributes.CompletedAt,
                ["#objectETag"] = UploadSessionAttributes.ObjectETag
            },
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                [":initiated"] = new() { S = UploadSessionStatuses.Initiated },
                [":completed"] = new() { S = UploadSessionStatuses.Completed },
                [":completedAt"] = new() { S = DateTimeOffset.UtcNow.ToString("O") },
                [":objectETag"] = new() { S = result.ETag }
            }
        }, cancellationToken);

        return Ok(new CompleteUploadResponse(videoId, objectKey, result.ETag));
    }

    [HttpPost("{videoId}/thumbnail")]
    [ProducesResponseType<CreateThumbnailUploadUrlResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CreateThumbnailUploadUrlResponse>> CreateThumbnailUploadUrl(
        string videoId,
        CreateThumbnailUploadUrlRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.ContentType) ||
            (!request.ContentType.Equals("image/jpeg", StringComparison.OrdinalIgnoreCase) &&
             !request.ContentType.Equals("image/png", StringComparison.OrdinalIgnoreCase) &&
             !request.ContentType.Equals("image/webp", StringComparison.OrdinalIgnoreCase)))
        {
            ModelState.AddModelError(nameof(request.ContentType), "ContentType must be image/jpeg, image/png, or image/webp.");
            return ValidationProblem(ModelState);
        }

        var sessionResult = await GetUploadSession(videoId, cancellationToken);
        if (sessionResult.Item.Count == 0)
        {
            return NotFound();
        }

        var ext = Path.GetExtension(request.FileName).ToLowerInvariant();
        if (string.IsNullOrEmpty(ext))
        {
            ext = request.ContentType switch
            {
                "image/png" => ".png",
                "image/webp" => ".webp",
                _ => ".jpg"
            };
        }

        var targetBucket = !string.IsNullOrWhiteSpace(_storageOptions.ProcessedBucketName)
            ? _storageOptions.ProcessedBucketName
            : _storageOptions.RawBucketName;

        var objectKey = $"thumbnails/{videoId}/custom{ext}";
        var expiresAt = DateTime.UtcNow.AddMinutes(15);

        var uploadUrl = await _s3.GetPreSignedURLAsync(new GetPreSignedUrlRequest
        {
            BucketName = targetBucket,
            Key = objectKey,
            Verb = HttpVerb.PUT,
            ContentType = request.ContentType,
            Expires = expiresAt
        });

        var publicUrl = !string.IsNullOrWhiteSpace(_storageOptions.CdnBaseUrl)
            ? $"{_storageOptions.CdnBaseUrl.TrimEnd('/')}/{objectKey}"
            : $"https://{targetBucket}.s3.amazonaws.com/{objectKey}";

        return Ok(new CreateThumbnailUploadUrlResponse(uploadUrl, publicUrl, expiresAt));
    }

    private Task<GetItemResponse> GetUploadSession(string videoId, CancellationToken cancellationToken)
    {
        return _dynamoDb.GetItemAsync(new GetItemRequest
        {
            TableName = _dynamoDbOptions.TableName,
            ConsistentRead = true,
            Key = new Dictionary<string, AttributeValue>
            {
                [DynamoAttributes.PartitionKey] = new() { S = UploadSessionKeys.PartitionKey(videoId) },
                [DynamoAttributes.SortKey] = new() { S = UploadSessionKeys.SortKeyTag }
            }
        }, cancellationToken);
    }
}
