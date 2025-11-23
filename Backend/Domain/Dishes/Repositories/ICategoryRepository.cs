using Core.Database;
using Domain.Dishes.Entities;

namespace Domain.Dishes.Repositories;

interface ICategoryRepository : IEntityRepository<Category>
{
}