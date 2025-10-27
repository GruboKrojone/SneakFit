namespace Core.Authentication;

public interface IUserContext
{
    public int? UserId { get; }
    public string? Email { get; }
    public string? Role { get; }
    public bool IsAuthenticated { get; }
}