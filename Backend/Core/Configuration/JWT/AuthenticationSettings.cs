namespace Core.Configuration.JWT;

public class AuthenticationSettings : IAuthenticationSettings
{
    public string JwtKey { get; set; } = string.Empty;
    public int JwtExpireHours { get; set; }
    public string JwtIssuer { get; set; } = string.Empty;
    public int RefreshTokenExpireDays { get; } = 6;
}