namespace Domain.Dishes.Dto;

public record DishDto(
    string Name,
    string? Description,
    int? Calories,
    int? Protein,
    int? Carbs,
    int? Fat);