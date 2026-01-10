using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Core.Database;

public sealed class UnitOfWork(DbContext dbContext) : IUnitOfWork
{
    private readonly DbContext _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    private IDbContextTransaction? _currentTransaction;
    private bool _disposed;

    public DbSet<TEntity> GetDbSet<TEntity>() where TEntity : EntityBase
    {
        ObjectDisposedException.ThrowIf(_disposed, this);
        return _dbContext.Set<TEntity>();
    }

    public async Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken)
    {
        ObjectDisposedException.ThrowIf(_disposed, this);

        if (_currentTransaction is not null)
            throw new InvalidOperationException("A transaction is already in progress.");

        _currentTransaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);
        return _currentTransaction;
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ObjectDisposedException.ThrowIf(_disposed, this);

        try
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            throw new InvalidOperationException(
                "Concurrency conflict occurred. The record was modified by another user.", ex);
        }
        catch (DbUpdateException ex)
        {
            throw new InvalidOperationException(
                "An error occurred while saving changes to the database.", ex);
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (_disposed)
            return;

        if (_currentTransaction is not null)
        {
            await _currentTransaction.DisposeAsync();
            _currentTransaction = null;
        }

        await _dbContext.DisposeAsync();
        _disposed = true;
    }
}