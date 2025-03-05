namespace Core.Configuration.JWT;

public interface IAuthenticationSettings
{
    string JwtKey { get; }
    int JwtExpireDays { get; }
    string JwtIssuer { get; }
}