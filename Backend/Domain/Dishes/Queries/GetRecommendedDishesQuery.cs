using System.Linq;
using Algorithm;
using Core.Authentication;
using Core.CQRS;
using Core.Middlewares;
using Domain.Categories.Dto;
using Domain.Categories.Entities;
using Domain.Dishes.Dto;
using Domain.Dishes.Repositories;
using Domain.Users.Repositories;


namespace Domain.Dishes.Queries;

public sealed record GetRecommendedDishesQuery(int MaxResults = 10) : IQuery<IEnumerable<DishCutDto>>;

internal sealed class GetRecommendedDishesQueryHandler(
    IDishRepository dishRepository,
    IUserRepository userRepository,
    IUserContext userContext,
    DishRecommendationAlgorithm recommendationAlgorithm) : IQueryHandler<GetRecommendedDishesQuery, IEnumerable<DishCutDto>>
{
    public async Task<IEnumerable<DishCutDto>> Handle(GetRecommendedDishesQuery request, CancellationToken cancellationToken)
    {
        var userId = userContext.UserId
                     ?? throw new DomainException("User is not authenticated", (int)CommonErrorCode.Unauthorized);

        var user = await userRepository.FindAsync(userId, cancellationToken)
                   ?? throw new DomainException("User not found", (int)CommonErrorCode.EntityNotFound);

        var publicDishes = await dishRepository.FindAsync(d => d.IsPublic, cancellationToken)
                           ?? throw new DomainException("No public dishes found", (int)CommonErrorCode.EntityNotFound);
        var privateDishes = await dishRepository.FindAsync(d => !d.IsPublic && d.OwnerId == userId, cancellationToken)
                            ?? [];

        publicDishes = [.. publicDishes, .. privateDishes];

        var dishDataList = publicDishes.Select(d => new DishData(
            d.Id,
            d.Rates,
            d.FavoritedByUsers?.Count ?? 0,
            d.Categories?.Select(c => c.Id) ?? []
        ));

        var userFavoriteDishIds = user.FavoriteDishes?.Select(d => d.Id) ?? [];
        var userFavoriteCategoryIds = user.FavoriteDishes?
            .SelectMany(d => d.Categories?.Select(c => c.Id) ?? [])
            .Distinct() ?? [];

        var recommendations = recommendationAlgorithm.CalculateRecommendations(
            dishDataList,
            userFavoriteDishIds,
            userFavoriteCategoryIds,
            request.MaxResults);

        var recommendedDishIds = recommendations.Select(r => r.DishId).ToHashSet();

        var recommendedDishes = publicDishes
            .Where(d => recommendedDishIds.Contains(d.Id))
            .OrderBy(d => recommendations.First(r => r.DishId == d.Id).Score)
            .Select(d => new DishCutDto(
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
                null,
                null,
                null
            ));

        var shuffledRecommendedDishes = recommendedDishes
            .OrderBy(_ => Guid.NewGuid())
            .Take(request.MaxResults);

        return shuffledRecommendedDishes;
    }
}