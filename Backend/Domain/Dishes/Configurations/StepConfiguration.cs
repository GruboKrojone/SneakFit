using Core.Database;
using Domain.Dishes.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Domain.Dishes.Configurations;

internal sealed class StepConfiguration : EntityBaseConfiguration<Step>
{
    protected override void ConfigureEntity(EntityTypeBuilder<Step> builder)
    {
        builder.ToTable("Steps");

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.HasOne(x => x.Dish)
            .WithMany(x => x.Steps)
            .HasForeignKey(x => x.DishId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.Name);
    }
}