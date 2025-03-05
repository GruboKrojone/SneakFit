using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Core.Database;

public interface IUnitOfWork
{
    DbSet<TEntity> GetDbSet<TEntity>() where TEntity : EntityBase;

    Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

