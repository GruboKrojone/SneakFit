using Domain.Categories.Dto;

namespace Domain.Dishes.Dto;

public record DishDetails(
    int Id,
    string Name,
    string? Description,
    int? Calories,
    int? Protein,
    int? Carbs,
    int? Fat,
    bool IsPublic,
    decimal Rates,
    int OwnerId,
    List<IngredientDto>? Ingredients,
    List<CategoryDto>? Categories);