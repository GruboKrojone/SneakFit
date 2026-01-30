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

        builder.HasOne(x => x.MainPicture)
            .WithMany()
            .HasForeignKey(x => x.MainPictureId)
            .OnDelete(DeleteBehavior.NoAction)
            .IsRequired(false);

        builder.HasOne(x => x.SecondaryPicture)
            .WithMany()
            .HasForeignKey(x => x.SecondaryPictureId)
            .OnDelete(DeleteBehavior.NoAction)
            .IsRequired(false);

        builder.HasOne(x => x.ThirdPicture)
            .WithMany()
            .HasForeignKey(x => x.ThirdPictureId)
            .OnDelete(DeleteBehavior.NoAction)
            .IsRequired(false);

        builder.HasMany(x => x.Categories)
            .WithMany(x => x.Dishes);

        builder.HasMany(x => x.Ingredients)
              .WithMany(x => x.Dishes);

        builder.HasIndex(x => x.IsPublic);
        builder.HasIndex(x => new { x.IsPublic, x.IsDeleted });
    }
}