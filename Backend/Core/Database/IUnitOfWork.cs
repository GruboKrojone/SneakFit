using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Core.Database;

public interface IUnitOfWork
{
    public DbSet<TEntity> GetDbSet<TEntity>() where TEntity : EntityBase;

    public Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken);
    public Task SaveChangesAsync(CancellationToken cancellationToken = default);
}