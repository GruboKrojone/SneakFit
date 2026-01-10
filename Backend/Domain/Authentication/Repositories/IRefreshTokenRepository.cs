using Domain.Authentication.Entities;

namespace Domain.Authentication.Repositories;

internal interface IRefreshTokenRepository
{
    Task<RefreshToken?> FindByTokenAsync(string token, CancellationToken cancellationToken);
    Task AddAsync(RefreshToken refreshToken, CancellationToken cancellationToken);
    Task RevokeAllUserTokensAsync(int userId, CancellationToken cancellationToken);
}