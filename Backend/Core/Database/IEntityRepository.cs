using System.Linq.Expressions;

namespace Core.Database;

public interface IEntityRepository<TEntity> where TEntity : EntityBase
{
    public Task<IList<TEntity>> FindAsync(IList<int> ids, CancellationToken cancellationToken);

    public Task<TEntity> FindAsync(int id, CancellationToken cancellationToken);

    public Task<IList<TEntity>> FindAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken);
        
    public Task<bool> AnyAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken);

    public Task<IList<TResult>> FindAsync<TResult>(
        Expression<Func<TEntity, bool>> predicate,
        Expression<Func<TEntity, TResult>> projection,
        CancellationToken cancellationToken);

    public Task<IList<TResult>> FindAsync<TResult, TSort>(
        IEnumerable<Expression<Func<TEntity, bool>>?> predicates,
        Expression<Func<TEntity, TSort>> orderSelector,
        Expression<Func<TEntity, TResult>> projection,
        CancellationToken cancellationToken,
        bool ascending = true);

    public void Add(TEntity entity);
    
    public void Update(TEntity entity);
    
    public void Delete(TEntity entity);
}