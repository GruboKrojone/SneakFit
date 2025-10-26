using Core.Database;
using Domain.Users.Entities;

namespace Domain.Users.Repositories;

internal interface IUserRepository : IEntityRepository<User>
{
    public Task<User?> FindByEmailAsync(string email, CancellationToken cancellationToken);
}