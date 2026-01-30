namespace Core.Configuration.JWT;

public interface IAuthenticationSettings
{
    public string JwtKey { get; }
    public int JwtExpireHours { get; }
    public string JwtIssuer { get; }
    public int RefreshTokenExpireDays { get; }
}