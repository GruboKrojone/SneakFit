namespace Domain.Users.Dtos;

public record ChangePasswordDto(string OldPassword, string NewPassword);
