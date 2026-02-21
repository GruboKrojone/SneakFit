using Core.Authentication;
using Core.CQRS;
using Core.Middlewares;
using Domain.Categories.Dto;
using Domain.Dishes.Dto;
using Domain.Users.Repositories;

namespace Domain.Dishes.Queries;

public record GetFavoritedDishesQuery() : IQuery<IEnumerable<DishCutDto>>;

internal class GetFavoritedDishesQueryHandler(
    IUserRepository userRepository,
    IUserContext userContext) : IQueryHandler<GetFavoritedDishesQuery, IEnumerable<DishCutDto>>
{
    public async Task<IEnumerable<DishCutDto>> Handle(GetFavoritedDishesQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = userContext.UserId
            ?? throw new DomainException("User is not authenticated", (int)CommonErrorCode.Unauthorized);

        var user = await userRepository.FindAsync(currentUserId, cancellationToken)
            ?? throw new DomainException("User not found", (int)CommonErrorCode.EntityNotFound);

        var favoritedDishes = user.FavoriteDishes
            .Where(d => d.IsPublic || d.OwnerId == currentUserId)
            .Select(d => new DishCutDto(
                d.Id,
                d.Name,
                d.Description ?? "No desc available",
                d.Rates,
                d.OwnerId,
                d.Owner?.Name ?? "Unknown",
                d.IsPublic,
                d.Categories != null
                    ? [.. d.Categories.Select(c => new CategoryDto(c.Id, c.Name))]
                    : [],
                d.MainPictureId,
                d.SecondaryPictureId,
                d.ThirdPictureId
            ));

        return favoritedDishes;
    }
}