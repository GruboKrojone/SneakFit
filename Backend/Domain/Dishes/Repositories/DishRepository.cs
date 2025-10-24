using Core.Database;
using Domain.Dishes.Entities;

namespace Domain.Dishes.Repositories;

internal sealed class DishRepository(
    IUnitOfWork unitOfWork,
    SneakFitDbContext dbContext) : EntityRepositoryBase<Dish>(unitOfWork), IDishRepository
{
    protected override IQueryable<Dish> GetQuery()
        => dbContext.Dishes.AsQueryable();
}
