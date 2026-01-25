using Core.Database;
using Domain.Images.Entities;
using Microsoft.EntityFrameworkCore;

namespace Domain.Images.Repositories;

internal class ImageRepository(SneakFitDbContext dbContext) : EntityRepositoryBase<Image>(dbContext), IImageRepository
{
    protected override IQueryable<Image> GetQuery()
        => dbContext.Images.AsQueryable()
            .Include(image => image.Owner);
}
