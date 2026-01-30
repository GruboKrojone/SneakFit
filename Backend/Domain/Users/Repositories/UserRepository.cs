using Core.Database;
using Domain.Users.Entities;
using Domain.Users.Enums;
using Microsoft.EntityFrameworkCore;

namespace Domain.Users.Repositories;

internal sealed class UserRepository(
    SneakFitDbContext dbContext
) : EntityRepositoryBase<User>(dbContext), IUserRepository
{
    public async Task<User?> FindByEmailAsync(string email, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users.SingleOrDefaultAsync(u => u.Email == email, cancellationToken);
        return user ?? null;
    }

    protected override IQueryable<User> GetQuery()
        => dbContext.Users.AsQueryable()
            .Include(u => u.FavoriteDishes);

    public bool IsOperationAllowed(int userId, int? dishId)
    {
        var user = dbContext.Users
            .AsNoTracking()
            .FirstOrDefault(u => u.Id == userId);

        var dish = dbContext.Dishes
            .AsNoTracking()
            .FirstOrDefault(d => d.Id == dishId);

        if (user == null || dish == null)
            return false;

        if (dish.OwnerId == user.Id
            || user.Role == UserRole.Admin
            || user.Role == UserRole.Employee)
            return true;

        return false;
    }
}