using Domain.Users.Enums;

namespace Domain.Authentication.Services;

public interface IAuthService
{
    public string GenerateToken(string email, UserRole role, int userId);
    public byte[] ComputePasswordHash(string password, byte[] salt);
}