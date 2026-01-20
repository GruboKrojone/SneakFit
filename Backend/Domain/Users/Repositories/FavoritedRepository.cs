using Core.Database;
using Domain.Users.Entities;
using Microsoft.EntityFrameworkCore;

namespace Domain.Users.Repositories;

internal class FavoritedRepository(SneakFitDbContext dbContext) : EntityRepositoryBase<Favorited>(dbContext), IFavoritedRepository
{
    protected override IQueryable<Favorited> GetQuery()
        => dbContext.Favorited.AsQueryable()
            .Include(f => f.User)
            .Include(f => f.Dish);
}
