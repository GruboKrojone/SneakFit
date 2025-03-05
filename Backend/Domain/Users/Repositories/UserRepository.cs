using Core.Database;
using Domain.Users.Entities;
using Microsoft.EntityFrameworkCore;

namespace Domain.Users.Repositories;

internal class UserRepository(
    IUnitOfWork unitOfWork,
    SneakFitDbContext dbContext
) : EntityRepositoryBase<User>(unitOfWork), IUserRepository
{
    public IQueryable<User> Query()
        => dbContext.Users;
    
    protected override IQueryable<User> GetQuery()
        => Query().AsQueryable();
    
    public async Task<User?> FindByEmailAsync(string email, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users.SingleOrDefaultAsync(u => u.Email == email, cancellationToken);
        return user ?? null;
    }
}