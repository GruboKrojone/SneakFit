using Core.Database;
using Domain.Categories.Entities;

namespace Domain.Categories.Repositories;

internal sealed class CategoryRepository(SneakFitDbContext dbContext)
    : EntityRepositoryBase<Category>(dbContext), ICategoryRepository
{
    protected override IQueryable<Category> GetQuery() => dbContext.Categories.AsQueryable();
}