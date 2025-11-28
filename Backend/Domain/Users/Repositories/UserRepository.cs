using Core.Database;
using Domain.Users.Entities;
using Domain.Users.Enums;
using Microsoft.EntityFrameworkCore;

namespace Domain.Users.Repositories;

sealed class UserRepository(
    IUnitOfWork unitOfWork,
    SneakFitDbContext dbContext
) : EntityRepositoryBase<User>(unitOfWork), IUserRepository
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
        var user = dbContext.Users.FirstOrDefault(u => u.Id == userId);
        var dish = dbContext.Dishes.FirstOrDefault(d => d.Id == dishId);

        if (dish.OwnerId == user.Id
            || user.Role == UserRole.Admin
            || user.Role == UserRole.Employee)
            return true;

        return false;
    }
}