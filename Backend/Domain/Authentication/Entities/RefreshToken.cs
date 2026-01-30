using Core.Database;

namespace Domain.Authentication.Entities;

internal sealed class RefreshToken : EntityBase
{
    public string Token { get; private set; }
    public int UserId { get; private set; }
    public DateTime ExpiresAt { get; private set; }
    public bool IsRevoked { get; private set; }
    public DateTime? RevokedAt { get; private set; }

    private RefreshToken()
    {
        Token = string.Empty;
    }

    public RefreshToken(string token, int userId, DateTime expiresAt)
    {
        Token = token;
        UserId = userId;
        ExpiresAt = expiresAt;
        IsRevoked = false;
    }

    public bool IsExpired() => DateTime.UtcNow >= ExpiresAt;

    public bool IsActive() => !IsRevoked && !IsExpired();

    public void Revoke()
    {
        IsRevoked = true;
        RevokedAt = DateTime.UtcNow;
        MarkAsUpdated();
    }
}