using Core.Database;
using Domain.Users.Entities;

namespace Domain.Users.Repositories;

interface IUserRepository : IEntityRepository<User>
{
    public Task<User?> FindByEmailAsync(string email, CancellationToken cancellationToken);

    public bool IsOperationAllowed(int userId, int? dishId);
}