using Core.Database;
using Domain.Users.Entities;

namespace Domain.Dishes.Entities;

public sealed class DishRating : EntityBase
{
    public int UserId { get; private set; }
    public User User { get; private set; } = null!;
    public int DishId { get; private set; }
    public Dish Dish { get; private set; } = null!;
    public decimal Rating { get; private set; }

    private DishRating() { }

    public DishRating(int userId, int dishId, decimal rating)
    {
        UserId = userId;
        DishId = dishId;
        SetRating(rating);
    }

    public void SetRating(decimal rating)
    {
        if (rating < 0 || rating > 5)
            throw new ArgumentException("Rating must be between 0 and 5", nameof(rating));

        Rating = Math.Round(rating, 2);
        MarkAsUpdated();
    }
}