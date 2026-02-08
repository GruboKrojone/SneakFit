using Core.Database;
using Domain.Categories.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Domain.Categories.Configurations;

internal sealed class CategoryConfiguration : EntityBaseConfiguration<Category>
{
    protected override void ConfigureEntity(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("Categories");

        builder.Property(x => x.NameEn).IsRequired().HasMaxLength(100);
        builder.Property(x => x.NamePl).IsRequired().HasMaxLength(100);
        builder.Property(x => x.NameDe).IsRequired().HasMaxLength(100);
        builder.Property(x => x.NameEs).IsRequired().HasMaxLength(100);

        builder.HasIndex(x => x.NameEn).IsUnique();
    }
}