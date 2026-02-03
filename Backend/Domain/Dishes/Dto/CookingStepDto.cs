namespace Domain.Dishes.Dto;

public record CookingStepDto(
    int Id,
    string Name,
    string? Description,
    int Order);
