using System.Linq;
using Core.Authentication;
using Core.CQRS;
using Core.Middlewares;
using Domain.Categories.Dto;
using Domain.Categories.Entities;
using Domain.Dishes.Dto;
using Domain.Dishes.Repositories;

namespace Domain.Dishes.Queries;

public record DishDetailsQuery(int DishId) : IQuery<DishDetails>;

internal sealed class DishDetailsQueryHandler(
    IDishRepository dishRepository,
    IUserContext userContext) : IQueryHandler<DishDetailsQuery, DishDetails>
{
    public async Task<DishDetails> Handle(DishDetailsQuery query, CancellationToken cancellationToken)
    {
        var dish = await dishRepository.FindAsync(query.DishId, cancellationToken)
                   ?? throw new DomainException($"Dish with provided ID: {query.DishId} not found",
                       (int)CommonErrorCode.EntityNotFound);

        if (!dish.IsPublic && dish.OwnerId != userContext.UserId)
            throw new DomainException("You are not authorized to view this dish", (int)CommonErrorCode.Unauthorized);

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
            dish.Ingredients?.Select(i => new IngredientDto(i.Id, i.Name, i.Description)).ToList() ?? [],
            dish.Categories?.Select(c => new CategoryDto(c.Id, c.NameEn, c.NamePl, c.NameDe, c.NameEs, c.Color)).ToList() ?? []
        );
    }
}