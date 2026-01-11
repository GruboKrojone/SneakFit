using System.ComponentModel.DataAnnotations;
using Core.Database;
using Microsoft.EntityFrameworkCore;

namespace Domain.Dishes.Entities;

public sealed class Ingredient(
    string name,
    string? description) : EntityBase
{
    [Required][MaxLength(100)] public string Name { get; private set; } = name;
    [MaxLength(280)] public string? Description { get; private set; } = description;
    public ICollection<Dish>? Dishes { get; private set; } = [];


    public static void OnModelCreating(ModelBuilder builder)
    {
        builder.Entity<Ingredient>().HasKey(x => x.Id);
        builder.Entity<Ingredient>()
            .Property(i => i.Name)
            .IsRequired()
            .HasMaxLength(100);
    }
}