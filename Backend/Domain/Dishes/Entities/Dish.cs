using Core.Database;
using Domain.Categories.Entities;
using Domain.Comments.Entities;
using Domain.Dishes.Dto;
using Domain.Images.Entities;
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
    public int? MainPictureId { get; set; }
    public Image? MainPicture { get; set; }
    public int? SecondaryPictureId { get; set; }
    public Image? SecondaryPicture { get; set; }
    public int? ThirdPictureId { get; set; }
    public Image? ThirdPicture { get; set; }
    public ICollection<Category> Categories { get; private set; }
    public ICollection<Ingredient> Ingredients { get; private set; }
    public ICollection<User> FavoritedByUsers { get; private set; }
    public ICollection<Comment> Comments { get; private set; }
    public ICollection<DishRating> Ratings { get; private set; }

    private Dish()
    {
        Name = string.Empty;
        Categories = [];
        Ingredients = [];
        FavoritedByUsers = [];
        Comments = [];
        Ratings = [];
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

    public void RecalculateAverageRating()
    {
        if (Ratings.Any())
        {
            Rates = Math.Round(Ratings.Average(r => r.Rating), 2);
        }
        else
        {
            Rates = 0;
        }
        MarkAsUpdated();
    }

    public void AssignImages(int? mainId, int? secondId, int? thirdId)
    {
        MainPictureId = mainId;
        SecondaryPictureId = secondId;
        ThirdPictureId = thirdId;
        MarkAsUpdated();
    }
}