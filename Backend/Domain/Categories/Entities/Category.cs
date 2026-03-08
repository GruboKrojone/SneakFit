using Core.Database;
using Domain.Dishes.Entities;

namespace Domain.Categories.Entities;

public sealed class Category(string nameEn, string namePl, string nameDe, string nameEs, string color) : EntityBase
{
    public string NameEn { get; private set; } = nameEn;
    public string NamePl { get; private set; } = namePl;
    public string NameDe { get; private set; } = nameDe;
    public string NameEs { get; private set; } = nameEs;
    public string Color { get; private set; } = color;
    public ICollection<Dish> Dishes { get; private set; } = [];
}