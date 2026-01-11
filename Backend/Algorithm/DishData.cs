namespace Algorithm;

public sealed record DishData(
    int DishId,
    decimal Rates,
    int FavoriteCount,
    IEnumerable<int> CategoryIds);