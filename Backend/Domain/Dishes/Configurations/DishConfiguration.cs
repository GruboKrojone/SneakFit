using Domain.Dishes.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Domain.Dishes.Configurations;

internal sealed class DishConfiguration : IEntityTypeConfiguration<Dish>
{
    public void Configure(EntityTypeBuilder<Dish> builder)
    {
        builder.ToTable("Dishes");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Description)
            .HasMaxLength(280);

        builder.Property(x => x.Calories)
            .IsRequired(false);

        builder.Property(x => x.Protein)
            .IsRequired(false);

        builder.Property(x => x.Carbs)
            .IsRequired(false);

        builder.Property(x => x.Fat)
            .IsRequired(false);

        builder.Property(x => x.IsPublic)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(x => x.Rates)
            .IsRequired()
            .HasDefaultValue(0m)
            .HasColumnType("decimal(3, 2)");

        builder.Property(x => x.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.UpdatedAt)
            .IsRequired(false);

        builder.Property(x => x.IsDeleted)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(x => x.DeletedAt)
            .IsRequired(false);

        builder.HasOne(d => d.Owner)
            .WithMany()
            .HasForeignKey(d => d.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(d => d.Ingredients)
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

        builder.HasMany(d => d.Categories)
            .WithMany(c => c.Dishes)
            .UsingEntity<Dictionary<string, object>>(
                "DishCategory",
                j => j.HasOne<Category>().WithMany().HasForeignKey("CategoryId").OnDelete(DeleteBehavior.Cascade),
                j => j.HasOne<Dish>().WithMany().HasForeignKey("DishId").OnDelete(DeleteBehavior.Cascade),
                j =>
                {
                    j.HasKey("DishId", "CategoryId");
                    j.ToTable("DishCategories");
                }
            );

        builder.HasIndex(d => d.OwnerId);
        builder.HasIndex(d => d.IsPublic);
        builder.HasIndex(d => new { d.IsPublic, d.IsDeleted });
    }
}