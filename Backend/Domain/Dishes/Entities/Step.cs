using Core.Database;

namespace Domain.Dishes.Entities;

public sealed class Step(string name, string description, int order, int dishId) : EntityBase
{
    public string Name { get; set; } = name;
    public string Description { get; set; } = description;
    public int Order { get; set; } = order;
    public int DishId { get; set; } = dishId;
    public Dish Dish { get; set; }
}
