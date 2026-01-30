using Core.Database;
using Domain.Categories.Entities;

namespace Domain.Categories.Repositories;

interface ICategoryRepository : IEntityRepository<Category>
{
}