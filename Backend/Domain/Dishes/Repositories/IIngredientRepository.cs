using Core.Database;
using Domain.Dishes.Entities;

namespace Domain.Dishes.Repositories;

internal interface IIngredientRepository : IEntityRepository<Ingredient>
{
}