using Core.Database;
using Domain.Dishes.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Domain.Dishes.Configurations;

internal sealed class DishConfiguration : EntityBaseConfiguration<Dish>
{
    protected override void ConfigureEntity(EntityTypeBuilder<Dish> builder)
    {
        builder.ToTable("Dishes");

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Description)
            .HasMaxLength(280);

        builder.Property(x => x.Calories);
        builder.Property(x => x.Protein);
        builder.Property(x => x.Carbs);
        builder.Property(x => x.Fat);

        builder.Property(x => x.IsPublic)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(x => x.Rates)
            .HasColumnType("decimal(3, 2)")
            .HasDefaultValue(0);

        builder.HasOne(x => x.Owner)
            .WithMany()
            .HasForeignKey(x => x.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Categories)
            .WithMany(x => x.Dishes)
            .UsingEntity(
                "DishCategory",
                l => l.HasOne(typeof(Category)).WithMany().HasForeignKey("CategoryId"),
                r => r.HasOne(typeof(Dish)).WithMany().HasForeignKey("DishId"),
                j => j.ToTable("DishCategories"));

        builder.HasMany(x => x.Ingredients)
            .WithMany(x => x.Dishes)
            .UsingEntity(
                "DishIngredient",
                l => l.HasOne(typeof(Ingredient)).WithMany().HasForeignKey("IngredientId"),
                r => r.HasOne(typeof(Dish)).WithMany().HasForeignKey("DishId"),
                j => j.ToTable("DishIngredients"));

        builder.HasMany(x => x.FavoritedByUsers)
            .WithMany(x => x.FavoriteDishes)
            .UsingEntity(j => j.ToTable("UserFavouriteDishes"));

        builder.HasIndex(x => x.IsPublic);
        builder.HasIndex(x => new { x.IsPublic, x.IsDeleted });
    }
}