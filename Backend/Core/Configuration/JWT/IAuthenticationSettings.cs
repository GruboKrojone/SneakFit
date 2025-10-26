namespace Core.Configuration.JWT;

public interface IAuthenticationSettings
{
    public string JwtKey { get; }
    public int JwtExpireDays { get; }
    public string JwtIssuer { get; }
}