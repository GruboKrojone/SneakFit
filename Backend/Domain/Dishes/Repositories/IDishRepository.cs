using Core.Authentication;
using Core.Database;
using Domain.Dishes.Entities;

namespace Domain.Dishes.Repositories;

interface IDishRepository : IEntityRepository<Dish>
{
    public bool IsUserAllowedToAccess(Dish dish, IUserContext userContext);
}