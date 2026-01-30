using Core.Database;
using Domain.Dishes.Entities;

namespace Domain.Dishes.Repositories;

internal sealed class IngredientRepository(
    SneakFitDbContext dbContext) : EntityRepositoryBase<Ingredient>(dbContext), IIngredientRepository
{
    protected override IQueryable<Ingredient> GetQuery()
        => dbContext.Ingredients.AsQueryable();
}