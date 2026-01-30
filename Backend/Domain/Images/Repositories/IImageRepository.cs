using Core.Database;
using Domain.Images.Entities;

namespace Domain.Images.Repositories;

internal interface IImageRepository : IEntityRepository<Image>
{
}
