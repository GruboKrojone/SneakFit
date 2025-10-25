using Core.CQRS;
using Core.Middlewares;
using Domain.Dishes.Dto;
using Domain.Dishes.Repositories;

namespace Domain.Dishes.Queries;

public record DishDetailsQuery(int DishId) : IQuery<DishDetails>;

internal class DishDetailsQueryHandler(
    IDishRepository dishRepository) : IQueryHandler<DishDetailsQuery, DishDetails>
{
    public async Task<DishDetails> Handle(DishDetailsQuery query, CancellationToken cancellationToken)
    {
        var dish = await dishRepository.FindAsync(query.DishId, cancellationToken)
                   ?? throw new DomainException($"Dish with provided ID: {query.DishId} not found", (int)CommonErrorCode.EntityNotFound);

        return new DishDetails(
            dish.Id,
            dish.Name,
            dish.Description,
            dish.Calories,
            dish.Protein,
            dish.Carbs,
            dish.Fat,
            dish.IsPublic,
            dish.Rates,
            dish.OwnerId,
            dish.Ingredients?.Select(i => new IngredientDto(i.Name, null)).ToList() ?? new List<IngredientDto>()
        );
    }
}