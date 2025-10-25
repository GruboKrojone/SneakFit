using System.ComponentModel.DataAnnotations;
using Core.Database;
using Domain.Users.Entities;
using Microsoft.EntityFrameworkCore;

namespace Domain.Dishes.Entities;

sealed class Dish : EntityBase
{
    private Dish() { }

    public Dish(
        string name,
        string? description,
        int? calories,
        int? protein,
        int? carbs,
        int? fat,
        bool isPublic)
    {
        Name = name;
        Description = description;
        Calories = calories;
        Protein = protein;
        Carbs = carbs;
        Fat = fat;
        IsPublic = isPublic;
    }

    [Required, MaxLength(100)]
    public string Name { get; private set; }
    [MaxLength(500)]
    public string? Description { get; private set; }
    public int? Calories { get; private set; }
    public int? Protein { get; private set; }
    public int? Carbs { get; private set; }
    public int? Fat { get; private set; }
    public bool IsPublic { get; private set; }
    public float Rates { get; private set; } = 0;
    public int OwnerId { get; private set; }
    public User Owner { get; private set; }
    public List<Ingredient> Ingredients { get; private set; }

    public void AssignToUser(int ownerId)
    {
        OwnerId = ownerId;
    }


    public static void OnModelCreating(ModelBuilder builder)
    {
        builder.Entity<Dish>().HasKey(x => x.Id);

        builder.Entity<Dish>()
            .HasOne(d => d.Owner)
            .WithMany()
            .HasForeignKey(d => d.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.Entity<Dish>()
            .HasMany(d => d.Ingredients)
            .WithMany(i => i.Dishes)
            .UsingEntity<Dictionary<string, object>>(
                "DishIngredient",
                j => j.HasOne<Ingredient>().WithMany().HasForeignKey("IngredientId").OnDelete(DeleteBehavior.Cascade),
                j => j.HasOne<Dish>().WithMany().HasForeignKey("DishId").OnDelete(DeleteBehavior.Cascade),
                j =>
                {
                    j.HasKey("DishId", "IngredientId");
                    j.ToTable("DishIngredients");
                }
            );
    }
}