using System.Security.Claims;
using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;

namespace YuhTube.Upload.Api.Helpers;

public sealed record CognitoUserIdentity(
    string UserId,
    string UserName,
    string? UserAvatar
);

public static class CognitoAuthHelper
{
    public static CognitoUserIdentity? ExtractUser(HttpContext httpContext)
    {
        // 1. Try APIGatewayHttpApiV2ProxyRequest from Lambda context
        if (httpContext.Items.TryGetValue("LambdaRequestObject", out var lambdaObj) &&
            lambdaObj is APIGatewayHttpApiV2ProxyRequest proxyRequest &&
            proxyRequest.RequestContext?.Authorizer?.Jwt?.Claims != null)
        {
            var claims = proxyRequest.RequestContext.Authorizer.Jwt.Claims;
            var id = GetClaim(claims, "sub")
                ?? GetClaim(claims, "cognito:username")
                ?? GetClaim(claims, "username");

            if (!string.IsNullOrWhiteSpace(id))
            {
                var name = ResolveName(
                    GetClaim(claims, "name"),
                    GetClaim(claims, "cognito:username"),
                    GetClaim(claims, "email"));

                var picture = GetClaim(claims, "picture");
                var avatar = !string.IsNullOrWhiteSpace(picture) ? picture : BuildDicebearAvatar(name);

                return new CognitoUserIdentity(
                    UserId: id,
                    UserName: name,
                    UserAvatar: avatar);
            }
        }

        // 2. Try ClaimsPrincipal (HttpContext.User)
        if (httpContext.User?.Identity?.IsAuthenticated == true || (httpContext.User?.Claims != null && httpContext.User.Claims.Any()))
        {
            var id = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? httpContext.User.FindFirstValue("sub")
                ?? httpContext.User.FindFirstValue("cognito:username");

            if (!string.IsNullOrWhiteSpace(id))
            {
                var name = ResolveName(
                    httpContext.User.FindFirstValue("name"),
                    httpContext.User.FindFirstValue("cognito:username"),
                    httpContext.User.FindFirstValue(ClaimTypes.Email) ?? httpContext.User.FindFirstValue("email"));

                var picture = httpContext.User.FindFirstValue("picture");
                var avatar = !string.IsNullOrWhiteSpace(picture) ? picture : BuildDicebearAvatar(name);

                return new CognitoUserIdentity(
                    UserId: id,
                    UserName: name,
                    UserAvatar: avatar);
            }
        }

        // 3. Fallback: Parse Bearer JWT from Authorization header directly
        var authHeader = httpContext.Request.Headers.Authorization.ToString();
        if (!string.IsNullOrWhiteSpace(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            var token = authHeader["Bearer ".Length..].Trim();
            var claims = ParseJwtPayload(token);
            if (claims != null)
            {
                var id = claims.GetValueOrDefault("sub")
                    ?? claims.GetValueOrDefault("cognito:username")
                    ?? claims.GetValueOrDefault("username");

                if (!string.IsNullOrWhiteSpace(id))
                {
                    var name = ResolveName(
                        claims.GetValueOrDefault("name"),
                        claims.GetValueOrDefault("cognito:username"),
                        claims.GetValueOrDefault("email"));

                    var picture = claims.GetValueOrDefault("picture");
                    var avatar = !string.IsNullOrWhiteSpace(picture) ? picture : BuildDicebearAvatar(name);

                    return new CognitoUserIdentity(
                        UserId: id,
                        UserName: name,
                        UserAvatar: avatar);
                }
            }
        }

        return null;
    }

    private static string? GetClaim(IDictionary<string, string> dict, string key) =>
        dict.TryGetValue(key, out var val) && !string.IsNullOrWhiteSpace(val) ? val : null;

    private static string ResolveName(string? name, string? username, string? email)
    {
        if (!string.IsNullOrWhiteSpace(name))
            return name.Trim();

        if (!string.IsNullOrWhiteSpace(username) && !username.Contains('@'))
            return username.Trim();

        if (!string.IsNullOrWhiteSpace(email))
        {
            var atIndex = email.IndexOf('@');
            return atIndex > 0 ? email[..atIndex].Trim() : email.Trim();
        }

        if (!string.IsNullOrWhiteSpace(username))
        {
            var atIndex = username.IndexOf('@');
            return atIndex > 0 ? username[..atIndex].Trim() : username.Trim();
        }

        return "Creator";
    }

    private static string BuildDicebearAvatar(string name) =>
        $"https://api.dicebear.com/7.x/initials/svg?seed={Uri.EscapeDataString(name)}";

    private static Dictionary<string, string>? ParseJwtPayload(string jwt)
    {
        try
        {
            var parts = jwt.Split('.');
            if (parts.Length < 2) return null;

            var payload = parts[1].Replace('-', '+').Replace('_', '/');
            switch (payload.Length % 4)
            {
                case 2: payload += "=="; break;
                case 3: payload += "="; break;
            }

            var bytes = Convert.FromBase64String(payload);
            using var doc = JsonDocument.Parse(bytes);
            var dict = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            foreach (var prop in doc.RootElement.EnumerateObject())
            {
                if (prop.Value.ValueKind == JsonValueKind.String)
                {
                    dict[prop.Name] = prop.Value.GetString()!;
                }
            }
            return dict;
        }
        catch
        {
            return null;
        }
    }
}
