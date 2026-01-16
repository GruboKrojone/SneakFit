using Core.Database;
using Domain.Dishes.Entities;

namespace Domain.Users.Entities;

internal class Favorited(int userId, int dishId) : EntityBase
{
    public int UserId { get; set; } = userId;
    public User User { get; set; } = null!;

    public int DishId { get; set; } = dishId;
    public Dish Dish { get; set; } = null!;
}