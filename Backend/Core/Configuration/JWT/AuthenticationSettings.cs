namespace Core.Configuration.JWT;

public class AuthenticationSettings : IAuthenticationSettings
{
    public string JwtKey { get; set; } = string.Empty;
    public int JwtExpireDays { get; set; }
    public string JwtIssuer { get; set; } = string.Empty;
}