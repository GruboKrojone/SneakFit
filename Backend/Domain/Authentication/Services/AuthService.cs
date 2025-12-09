using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Core.Middlewares;
using Domain.Authentication.Enums;
using Domain.Users.Enums;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Domain.Authentication.Services;

internal sealed class AuthService(IConfiguration configuration) : IAuthService
{
    public string GenerateToken(string email, UserRole role, int userId)
    {
        var jwtKey = configuration["App:Authentication:JwtKey"];
        if (string.IsNullOrEmpty(jwtKey))
            throw new ArgumentNullException(nameof(jwtKey), "JWT Key is not configured.");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, role.ToString())
        };

        var token = new JwtSecurityToken(
            configuration["App:Authentication:JwtIssuer"],
            configuration["App:Authentication:JwtIssuer"],
            claims,
            expires: DateTime.UtcNow.AddHours(
                int.Parse(configuration["App:Authentication:JwtExpireHours"]
                          ?? throw new DomainException("JwtExpireHours not configured",
                              (int)AuthErrorCode.JwtExpireHoursNotConfigured))),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public string HashPassword(string password)
        => BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);

    public bool VerifyPassword(string password, string hash)
        => BCrypt.Net.BCrypt.Verify(password, hash);
}