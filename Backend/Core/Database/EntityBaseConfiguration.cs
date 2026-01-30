using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Core.Database;

public abstract class EntityBaseConfiguration<TEntity> : IEntityTypeConfiguration<TEntity>
    where TEntity : EntityBase
{
    public virtual void Configure(EntityTypeBuilder<TEntity> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CreatedAt)
            .IsRequired()
            .ValueGeneratedOnAdd();

        builder.Property(x => x.UpdatedAt)
            .IsRequired(false);

        builder.Property(x => x.IsDeleted)
            .IsRequired();

        builder.Property(x => x.DeletedAt)
            .IsRequired(false);

        ConfigureEntity(builder);
    }

    protected abstract void ConfigureEntity(EntityTypeBuilder<TEntity> builder);
}