using Core.Database;
using Domain.Comments.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Domain.Comments.Configurations;

internal class CommentConfiguration : EntityBaseConfiguration<Comment>
{
    protected override void ConfigureEntity(EntityTypeBuilder<Comment> builder)
    {
        builder.ToTable("Comments");

        builder.Property(x => x.Content)
            .IsRequired()
            .HasMaxLength(1000);

        builder.HasOne(x => x.Author)
            .WithMany(x => x.Comments)
            .HasForeignKey(x => x.AuthorId);

        builder.HasOne(x => x.Dish)
            .WithMany(x => x.Comments)
            .HasForeignKey(x => x.DishId);
    }
}
