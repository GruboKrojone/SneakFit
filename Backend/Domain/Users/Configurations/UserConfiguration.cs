using Core.Database;
using Domain.Users.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Domain.Users.Configurations;

internal sealed class UserConfiguration : EntityBaseConfiguration<User>
{
    protected override void ConfigureEntity(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        builder.Property(x => x.Email)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Password)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(x => x.Role)
            .IsRequired();

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Age);

        builder.Property(x => x.Lang)
            .IsRequired();

        builder.HasIndex(x => x.Email)
            .IsUnique();

        builder.HasMany(u => u.FavoriteDishes)
        .WithMany(d => d.FavoritedByUsers)
        .UsingEntity<Favorited>(
            j => j.HasOne(f => f.Dish)
                .WithMany()
                .HasForeignKey(f => f.DishId),
            j => j.HasOne(f => f.User)
                .WithMany()
                .HasForeignKey(f => f.UserId),
            j =>
            {
                j.ToTable("Favorited");
                j.HasKey(f => new { f.UserId, f.DishId });
            });
    }
}