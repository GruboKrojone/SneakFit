using System.ComponentModel.DataAnnotations;
using Core.Database;
using Microsoft.EntityFrameworkCore;

namespace Domain.Dishes.Entities;

sealed class Ingredient : EntityBase
{
    private Ingredient()
    {
    }

    public Ingredient(
        string name,
        string? description)
    {
        Name = name;
        Description = description;
        Dishes = new List<Dish>();
    }


    [Required][MaxLength(100)] public string Name { get; private set; }

    [MaxLength(500)] public string? Description { get; private set; }

    public List<Dish>? Dishes { get; private set; }


    public static void OnModelCreating(ModelBuilder builder)
    {
        builder.Entity<Ingredient>().HasKey(x => x.Id);

        builder.Entity<Ingredient>()
            .Property(i => i.Name)
            .IsRequired()
            .HasMaxLength(100);
    }
}