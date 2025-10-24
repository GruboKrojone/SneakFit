namespace Domain.Dishes.Dto;

public record AddDishParams(
    string Name,
    string? Description,
    int? Calories,
    int? Protein,
    int? Carbs,
    int? Fat,
    bool IsPublic
    );