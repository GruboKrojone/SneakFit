using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Core.Database;

public sealed class UnitOfWork(DbContext dbContext) : IUnitOfWork
{
    public DbSet<TEntity> GetDbSet<TEntity>() where TEntity : EntityBase
        => dbContext.Set<TEntity>();

    public Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken) 
        => dbContext.Database.BeginTransactionAsync(cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken)
        => dbContext.SaveChangesAsync(cancellationToken);
}