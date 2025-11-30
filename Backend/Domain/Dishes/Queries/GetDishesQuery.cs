using Core.Authentication;
using Core.CQRS;
using Core.Middlewares;
using Domain.Dishes.Dto;
using Domain.Dishes.Repositories;

namespace Domain.Dishes.Queries;

public record GetDishesQuery : IQuery<IEnumerable<DishCutDto>>;

internal sealed class GetDishesQueryHandler(
    IDishRepository dishRepository,
    IUserContext userContext) : IQueryHandler<GetDishesQuery, IEnumerable<DishCutDto>>
{
    public async Task<IEnumerable<DishCutDto>> Handle(GetDishesQuery request, CancellationToken cancellationToken)
    {
        var userId = userContext.UserId
                     ?? throw new DomainException("Nobody is authenticated", (int)CommonErrorCode.Unauthorized);

        var dishes = await dishRepository.FindAsync(
            d => d.OwnerId == userId || d.IsPublic,
            cancellationToken) ?? throw new DomainException("No dishes found", (int)CommonErrorCode.EntityNotFound);

        return dishes.Select(d => new DishCutDto(
            d.Id,
            d.Name,
            d.Rates,
            d.OwnerId,
            d.Owner!.Name,
            d.IsPublic,
            d.Categories != null
                ? [.. d.Categories.Select(c => new CategoryDto(c.Id, c.Name))]
                : [],
            1,
            null,
            null
        ));
    }
}