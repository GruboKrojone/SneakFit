using Core.Database;
using Domain.Categories.Entities;
using Domain.Dishes.Dto;
using Domain.Users.Entities;

namespace Domain.Dishes.Entities;

public sealed class Dish : EntityBase
{
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public int? Calories { get; private set; }
    public int? Protein { get; private set; }
    public int? Carbs { get; private set; }
    public int? Fat { get; private set; }
    public bool IsPublic { get; private set; }
    public decimal Rates { get; private set; }
    public int OwnerId { get; private set; }
    public User? Owner { get; }
    public ICollection<Category> Categories { get; private set; }
    public ICollection<Ingredient> Ingredients { get; private set; }
    public ICollection<User> FavoritedByUsers { get; private set; }

    private Dish()
    {
        Name = string.Empty;
        Categories = [];
        Ingredients = [];
        FavoritedByUsers = [];
        Rates = 0;
        IsPublic = false;
    }

    public Dish(
        string name,
        string? description,
        int? calories,
        int? protein,
        int? carbs,
        int? fat) : this()
    {
        Name = name;
        Description = description;
        Calories = calories;
        Protein = protein;
        Carbs = carbs;
        Fat = fat;
    }

    public void AssignToUser(int ownerId)
    {
        OwnerId = ownerId;
        MarkAsUpdated();
    }

    public void Update(
        string name,
        string? description,
        int? calories,
        int? protein,
        int? carbs,
        int? fat)
    {
        Name = name;
        Description = description;
        Calories = calories;
        Protein = protein;
        Carbs = carbs;
        Fat = fat;
        MarkAsUpdated();
    }

    public DishDto ToDto() =>
        new(Name, Description, Calories, Protein, Carbs, Fat);

    public void MarkAsPublic()
    {
        IsPublic = true;
        MarkAsUpdated();
    }

    public void UpdateRating(decimal newRating)
    {
        Rates = newRating;
        MarkAsUpdated();
    }
}