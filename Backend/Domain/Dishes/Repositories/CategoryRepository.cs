using Core.Database;
using Domain.Dishes.Entities;

namespace Domain.Dishes.Repositories;

internal sealed class CategoryRepository(SneakFitDbContext dbContext)
    : EntityRepositoryBase<Category>(dbContext), ICategoryRepository
{
    protected override IQueryable<Category> GetQuery() => dbContext.Categories.AsQueryable();
}