using Core.Database;
using Domain.Dishes.Entities;

namespace Domain.Categories.Entities;

public sealed class Category(string name) : EntityBase
{
    public string Name { get; private set; } = name;
    public ICollection<Dish> Dishes { get; private set; } = [];
}