namespace Domain.Dishes.Dto;

public record IngredientDto(
    int Id,
    string Name,
    string? Description);