using Domain.Dishes.Entities;

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
    float Rates,
    int OwnerId,
    List<IngredientDto>? Ingredients);