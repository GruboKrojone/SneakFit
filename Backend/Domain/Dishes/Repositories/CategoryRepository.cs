using Core.Database;
using Domain.Dishes.Entities;

namespace Domain.Dishes.Repositories;

internal sealed class CategoryRepository(IUnitOfWork unitOfWork, SneakFitDbContext dbContext)
    : EntityRepositoryBase<Category>(unitOfWork), ICategoryRepository
{
    protected override IQueryable<Category> GetQuery() => dbContext.Categories.AsQueryable();
}