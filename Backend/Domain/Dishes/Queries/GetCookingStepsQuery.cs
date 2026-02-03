using Core.CQRS;
using Core.Middlewares;
using Domain.Dishes.Dto;
using Domain.Dishes.Repositories;

namespace Domain.Dishes.Queries;

public record GetCookingStepsQuery(int DishId) : IQuery<IEnumerable<CookingStepDto>>;

internal class GetCookingStepsQueryHandler(
    IDishRepository dishRepository) : IQueryHandler<GetCookingStepsQuery, IEnumerable<CookingStepDto>>
{
    public async Task<IEnumerable<CookingStepDto>> Handle(GetCookingStepsQuery request, CancellationToken cancellationToken)
    {
        var dish = await dishRepository.FindAsync(request.DishId, cancellationToken)
            ?? throw new DomainException("Dish not found", (int)CommonErrorCode.EntityNotFound);

        return dish.Steps
            .OrderBy(s => s.Order)
            .Select(s => new CookingStepDto(s.Id, s.Name, s.Description, s.Order));
    }
}