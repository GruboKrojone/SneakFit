using Domain.Users.Enums;

namespace Domain.Authentication.Services;

public interface IAuthService
{
    string GenerateToken(string email, UserRole role, int userId);
    byte[] ComputePasswordHash(string password, byte[] salt);
}