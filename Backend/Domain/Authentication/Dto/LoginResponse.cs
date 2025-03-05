using Domain.Users.Enums;

namespace Domain.Authentication.Dto;

public record LoginResponse(
    int UserId,
    string? Email,
    UserRole? Role,
    string? AccessToken
);