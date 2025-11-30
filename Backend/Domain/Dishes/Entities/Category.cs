using Core.Database;
using Microsoft.EntityFrameworkCore;

namespace Domain.Dishes.Entities;

public sealed class Category(string name) : EntityBase
{
    public string Name { get; private set; } = name;
    public ICollection<Dish>? Dishes { get; private set; }


    public static void OnModelCreating(ModelBuilder builder)
    {
        builder.Entity<Category>().HasKey(x => x.Id);

        builder.Entity<Category>()
            .HasMany(c => c.Dishes)
            .WithMany(d => d.Categories)
            .UsingEntity<Dictionary<string, object>>(
                "DishCategory",
                j => j.HasOne<Dish>().WithMany().HasForeignKey("DishId").OnDelete(DeleteBehavior.Cascade),
                j => j.HasOne<Category>().WithMany().HasForeignKey("CategoryId").OnDelete(DeleteBehavior.Cascade),
                j => { j.HasKey("DishId", "CategoryId"); }
            );
    }
}