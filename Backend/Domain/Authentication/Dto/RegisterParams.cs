namespace Domain.Authentication.Dto;

public record RegisterParams(
    string Email,
    string Password,
    string? Name,
    int? Age);