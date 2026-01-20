using Domain.Users.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Domain.Users.Configurations;

internal class FavoritedConfiguration : IEntityTypeConfiguration<Favorited>
{
    public void Configure(EntityTypeBuilder<Favorited> builder)
    {
        builder.ToTable("Favorited");

        builder.HasKey(x => new { x.UserId, x.DishId });

        builder.Property(x => x.UserId).IsRequired();
        builder.Property(x => x.DishId).IsRequired();

        builder.HasOne(f => f.User)
            .WithMany()
            .HasForeignKey(f => f.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(f => f.Dish)
            .WithMany()
            .HasForeignKey(f => f.DishId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}