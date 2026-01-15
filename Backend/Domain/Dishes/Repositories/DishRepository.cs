using Core.Authentication;
using Core.Database;
using Domain.Dishes.Entities;
using Microsoft.EntityFrameworkCore;

namespace Domain.Dishes.Repositories;

internal sealed class DishRepository(
    SneakFitDbContext dbContext) : EntityRepositoryBase<Dish>(dbContext), IDishRepository
{
    public bool IsUserAllowedToAccess(Dish dish, IUserContext userContext)
        => !dish.IsPublic && dish.OwnerId == userContext.UserId;

    protected override IQueryable<Dish> GetQuery()
        => dbContext.Dishes.AsQueryable()
            .Include(d => d.Ingredients)
            .Include(d => d.Categories)
            .Include(d => d.Owner)
            .Include(d => d.Comments);
}