namespace Domain.Users.Dtos;

public record FavoritedDto(
    int UserId,
    int DishId
);