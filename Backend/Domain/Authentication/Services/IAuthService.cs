using Domain.Users.Enums;

namespace Domain.Authentication.Services;

public interface IAuthService
{
    public string GenerateToken(string email, UserRole role, int userId);
    public string GenerateRefreshToken();
    public string HashPassword(string password);
    public bool VerifyPassword(string password, string hash);
}