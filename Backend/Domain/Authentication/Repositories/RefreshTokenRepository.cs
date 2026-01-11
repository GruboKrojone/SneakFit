using Core.Database;
using Domain.Authentication.Entities;
using Microsoft.EntityFrameworkCore;

namespace Domain.Authentication.Repositories;

internal sealed class RefreshTokenRepository(SneakFitDbContext dbContext)
    : EntityRepositoryBase<RefreshToken>(dbContext), IRefreshTokenRepository
{
    protected DbSet<RefreshToken> DbSet => dbContext.Set<RefreshToken>();

    public async Task<RefreshToken?> FindByTokenAsync(string token, CancellationToken cancellationToken)
        => await GetQuery()
            .FirstOrDefaultAsync(x => x.Token == token && !x.IsDeleted, cancellationToken);

    public async Task AddAsync(RefreshToken refreshToken, CancellationToken cancellationToken)
        => await DbSet.AddAsync(refreshToken, cancellationToken);

    public async Task RevokeAllUserTokensAsync(int userId, CancellationToken cancellationToken)
    {
        var tokens = await GetQuery()
            .Where(x => x.UserId == userId && !x.IsRevoked && !x.IsDeleted)
            .ToListAsync(cancellationToken);

        foreach (var token in tokens)
        {
            token.Revoke();
        }
    }

    protected override IQueryable<RefreshToken> GetQuery()
        => DbSet.Where(x => !x.IsDeleted);
}