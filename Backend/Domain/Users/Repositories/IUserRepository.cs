using Core.Database;
using Domain.Users.Entities;

namespace Domain.Users.Repositories;

public interface IUserRepository : IEntityRepository<User>
{  
    Task<User?> FindByEmailAsync(string email, CancellationToken cancellationToken);
}