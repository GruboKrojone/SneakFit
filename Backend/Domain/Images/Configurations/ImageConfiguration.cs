using Core.Database;
using Domain.Images.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Domain.Images.Configurations;

internal sealed class ImageConfiguration : EntityBaseConfiguration<Image>
{
    protected override void ConfigureEntity(EntityTypeBuilder<Image> builder)
    {
        builder.ToTable("Images");

        builder.Property(image => image.Url)
            .IsRequired()
            .HasMaxLength(2048);

        builder.HasOne(image => image.Owner)
            .WithMany()
            .HasForeignKey(image => image.OwnerId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}