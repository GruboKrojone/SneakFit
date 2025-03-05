using System.ComponentModel.DataAnnotations;

namespace Domain.Authentication.Dto;

public record LoginParams
{
    public LoginParams(string email, string password)
    {
        Email = email;
        Password = password;
    }

    [Required, EmailAddress] public string Email { get; }
    [Required] public string Password { get; }
} 