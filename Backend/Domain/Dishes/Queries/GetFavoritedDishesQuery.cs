using Core.Authentication;
using Core.CQRS;
using Core.Middlewares;
using Domain.Categories.Dto;
using Domain.Dishes.Dto;
using Domain.Dishes.Repositories;
using Domain.Users.Repositories;

namespace Domain.Dishes.Queries;

public record GetFavoritedDishesQuery : IQuery<IEnumerable<DishCutDto>>;

internal sealed class GetFavoritedDishesQueryHandler(
    IDishRepository dishRepository,
    IUserRepository userRepository,
    IUserContext userContext) : IQueryHandler<GetFavoritedDishesQuery, IEnumerable<DishCutDto>>
{
    public async Task<IEnumerable<DishCutDto>> Handle(GetFavoritedDishesQuery request, CancellationToken cancellationToken)
    {
        var userId = userContext.UserId
                     ?? throw new DomainException("Nobody is authenticated", (int)CommonErrorCode.Unauthorized);

        var user = await userRepository.FindAsync(userId, cancellationToken)
                   ?? throw new DomainException("User not found", (int)CommonErrorCode.EntityNotFound);

        var favoriteDishIds = user.FavoriteDishes?.Select(d => d.Id).ToList() ?? [];
        if (favoriteDishIds.Count == 0)
            return [];

        var dishes = await dishRepository.FindAsync(favoriteDishIds, cancellationToken);

        return dishes.Select(d => new DishCutDto(
            d.Id,
            d.Name,
            d.Description ?? "No description available",
            d.Rates,
            d.OwnerId,
            d.Owner!.Name,
            d.IsPublic,
            d.Categories != null
                ? [.. d.Categories.Select(c => new CategoryDto(c.Id, c.NameEn, c.NamePl, c.NameDe, c.NameEs, c.Color))]
                : [],
            d.MainPictureId,
            d.SecondaryPictureId,
            d.ThirdPictureId
        ));
    }
}
