namespace YuhTube.Profile.Api.Dtos;

public sealed record UpdateProfileRequest(
    string? Name,
    string? AvatarUrl
);

public sealed record UserProfileResponse(
    string UserId,
    string Name,
    string? AvatarUrl
);
