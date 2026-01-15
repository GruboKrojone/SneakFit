using System.Security.Cryptography;

namespace Algorithm;

public class DishRecommendationAlgorithm
{
    private const decimal RatesWeight = 0.4m;
    private const decimal PopularityWeight = 0.3m;
    private const decimal FavoriteMatchWeight = 0.2m;
    private const decimal CategoryDiversityWeight = 0.1m;

    public IEnumerable<RecommendedDishResult> CalculateRecommendations(
        IEnumerable<DishData> allDishes,
        IEnumerable<int> userFavoriteDishIds,
        IEnumerable<int> userFavoriteCategoryIds,
        int maxResults = 10,
        bool shuffle = true)
    {
        if (!allDishes.Any())
            return [];

        var dishList = allDishes.ToList();
        var maxFavoriteCount = dishList.Max(d => d.FavoriteCount);
        var maxRates = dishList.Max(d => d.Rates);

        var scoredDishes = dishList
            .Select(dish => new RecommendedDishResult(
                dish.DishId,
                CalculateScore(
                    dish,
                    maxRates,
                    maxFavoriteCount,
                    userFavoriteDishIds,
                    userFavoriteCategoryIds)))
            .OrderByDescending(r => r.Score)
            .Take(maxResults);

        if (shuffle)
        {
            scoredDishes = scoredDishes.OrderBy(_ => RandomNumberGenerator.GetInt32(int.MaxValue));
        }

        return scoredDishes;
    }

    private static decimal CalculateScore(
        DishData dish,
        decimal maxRates,
        int maxFavoriteCount,
        IEnumerable<int> userFavoriteDishIds,
        IEnumerable<int> userFavoriteCategoryIds)
    {
        var normalizedRates = maxRates > 0 ? dish.Rates / maxRates : 0;
        var normalizedPopularity = maxFavoriteCount > 0 ? (decimal)dish.FavoriteCount / maxFavoriteCount : 0;

        var hasFavoriteMatch = userFavoriteDishIds.Contains(dish.DishId) ? 0m : 1m;

        var categoryMatchCount = dish.CategoryIds
            .Count(catId => userFavoriteCategoryIds.Contains(catId));
        var categoryDiversityScore = dish.CategoryIds.Any()
            ? (decimal)categoryMatchCount / dish.CategoryIds.Count()
            : 0m;

        var score = (normalizedRates * RatesWeight)
                    + (normalizedPopularity * PopularityWeight)
                    + (hasFavoriteMatch * FavoriteMatchWeight)
                    + (categoryDiversityScore * CategoryDiversityWeight);

        return score;
    }
}