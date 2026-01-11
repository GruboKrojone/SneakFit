namespace Domain.Dishes.Dto;

public record DishCutDto(
    int Id,
    string Name,
    decimal Rates,
    int UserId,
    string OwnerName,
    bool IsPublic,
    List<CategoryDto>? Categories,
    int? MainPictureId,
    int? SecondaryPictureId,
    int? ThirdPictureId);