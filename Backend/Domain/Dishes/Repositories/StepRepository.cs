using Core.Database;
using Domain.Dishes.Entities;

namespace Domain.Dishes.Repositories;

internal class StepRepository(
    SneakFitDbContext dbContext) : EntityRepositoryBase<Step>(dbContext), IStepRepository
{
    protected override IQueryable<Step> GetQuery() =>
        dbContext.Steps.AsQueryable();
}
