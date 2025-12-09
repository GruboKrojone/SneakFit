using Core.Database;
using Domain.Dishes.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Domain.Dishes.Configurations;

internal sealed class IngredientConfiguration : EntityBaseConfiguration<Ingredient>
{
    protected override void ConfigureEntity(EntityTypeBuilder<Ingredient> builder)
    {
        builder.ToTable("Ingredients");

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Description)
            .HasMaxLength(280);

        builder.HasIndex(x => x.Name);
    }
}