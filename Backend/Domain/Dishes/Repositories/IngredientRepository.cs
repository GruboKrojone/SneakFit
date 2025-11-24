using Core.Database;
using Domain.Dishes.Entities;

namespace Domain.Dishes.Repositories;

sealed class IngredientRepository(
    IUnitOfWork unitOfWork,
    SneakFitDbContext dbContext) : EntityRepositoryBase<Ingredient>(unitOfWork), IIngredientRepository
{
    protected override IQueryable<Ingredient> GetQuery()
        => dbContext.Ingredients.AsQueryable();
}