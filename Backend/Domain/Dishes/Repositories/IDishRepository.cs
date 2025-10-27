using Core.Authentication;
using Core.Database;
using Domain.Dishes.Entities;

namespace Domain.Dishes.Repositories;

internal interface IDishRepository : IEntityRepository<Dish>
{
    public bool IsUserAllowedToAccess(Dish dish, IUserContext userContext);
}