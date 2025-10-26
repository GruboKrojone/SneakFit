using Core.Database;
using Domain.Dishes.Entities;

namespace Domain.Dishes.Repositories;

internal interface ICategoryRepository : IEntityRepository<Category>
{
}