using Core.Database;

namespace Domain.Dishes.Entities;

public sealed class Category(string name) : EntityBase
{
    public string Name { get; private set; } = name;
    public ICollection<Dish> Dishes { get; private set; } = [];
}