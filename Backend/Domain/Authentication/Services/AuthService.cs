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

public class AuthService(IConfiguration configuration) : IAuthService
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
            issuer: configuration["App:Authentication:JwtIssuer"],
            audience: configuration["App:Authentication:JwtIssuer"],
            claims: claims,
            expires: DateTime.Now.AddDays(
                int.Parse(configuration["App:Authentication:JwtExpireDays"] 
                          ?? throw new DomainException("JwtExpireDays not configured", 
                              (int)AuthErrorCode.JwtExpireDaysNotConfigured))),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public byte[] ComputePasswordHash(string password, byte[] salt)
    {
        using var hmac = new HMACSHA512(salt);
        return hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
    }
}