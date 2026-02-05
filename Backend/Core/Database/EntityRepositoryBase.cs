using System.Linq.Expressions;
using Core.Middlewares;
using Microsoft.EntityFrameworkCore;

namespace Core.Database;

public abstract class EntityRepositoryBase<TEntity>(DbContext dbContext) : IEntityRepository<TEntity>
    where TEntity : EntityBase
{
    protected readonly DbContext DbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    private readonly DbSet<TEntity> _dbSet = dbContext.Set<TEntity>();

    public async Task<TEntity> FindAsync(int id, CancellationToken cancellationToken)
    {
        var entity = await GetQuery()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity ?? throw new DomainException(
            $"Entity with id {id} does not exist.",
            (int)CommonErrorCode.EntityNotFound);
    }

    public Task<IList<TEntity>> FindAsync(IList<int> ids, CancellationToken cancellationToken) =>
        FindAsync(ids, GetQuery(), cancellationToken);

    public Task<bool> AnyAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken) =>
        GetQuery().AsNoTracking().AnyAsync(predicate, cancellationToken);

    public async Task<TEntity?> FindIncludingDeletedAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken)
    {
        return await _dbSet
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(predicate, cancellationToken);
    }

    public async Task<IList<TResult>> FindAsync<TResult>(
        Expression<Func<TEntity, bool>> predicate,
        Expression<Func<TEntity, TResult>> projection,
        CancellationToken cancellationToken)
    {
        return await GetQuery()
            .AsNoTracking()
            .Where(predicate)
            .Select(projection)
            .ToListAsync(cancellationToken);
    }

    public async Task<IList<TResult>> FindAsync<TResult, TSort>(
        IEnumerable<Expression<Func<TEntity, bool>>?> predicates,
        Expression<Func<TEntity, TSort>> orderSelector,
        Expression<Func<TEntity, TResult>> projection,
        CancellationToken cancellationToken,
        bool ascending = true)
    {
        var query = GetQuery().AsNoTracking();

        if (predicates is not null)
        {
            foreach (var predicate in predicates.Where(p => p is not null))
            {
                query = query.Where(predicate!);
            }
        }

        query = ascending
            ? query.OrderBy(orderSelector)
            : query.OrderByDescending(orderSelector);

        return await query
            .Select(projection)
            .ToListAsync(cancellationToken);
    }

    public async Task<IList<TEntity>> FindAsync(
        Expression<Func<TEntity, bool>> predicate,
        CancellationToken cancellationToken) =>
        await GetQuery()
            .AsNoTracking()
            .Where(predicate)
            .ToListAsync(cancellationToken);

    public void Add(TEntity entity)
    {
        ArgumentNullException.ThrowIfNull(entity);
        _dbSet.Add(entity);
    }

    public void Update(TEntity entity)
    {
        ArgumentNullException.ThrowIfNull(entity);
        _dbSet.Update(entity);
    }

    public void Delete(TEntity entity)
    {
        ArgumentNullException.ThrowIfNull(entity);
        entity.MarkAsDeleted();
        _dbSet.Update(entity);
    }

    public void HardDelete(TEntity entity)
    {
        ArgumentNullException.ThrowIfNull(entity);
        _dbSet.Remove(entity);
    }

    protected abstract IQueryable<TEntity> GetQuery();

    private static async Task<IList<TEntity>> FindAsync(
        IList<int> ids,
        IQueryable<TEntity> query,
        CancellationToken cancellationToken)
    {
        if (ids is null || ids.Count == 0)
            return Array.Empty<TEntity>();

        var distinctIds = ids.Distinct().ToList();
        var entities = await query
            .AsNoTracking()
            .Where(x => distinctIds.Contains(x.Id))
            .ToListAsync(cancellationToken);

        if (entities.Count != distinctIds.Count)
        {
            var foundIds = entities.Select(x => x.Id).ToHashSet();
            var notFoundIds = distinctIds.Where(id => !foundIds.Contains(id)).ToList();

            throw new DomainException(
                $"Entities of type {typeof(TEntity).Name} with ids {string.Join(", ", notFoundIds)} do not exist.",
                (int)CommonErrorCode.EntityNotFound);
        }

        return entities;
    }
}