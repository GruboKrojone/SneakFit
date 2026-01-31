using System.Reflection;
using Core.Database;
using Domain.Authentication.Configurations;
using Domain.Authentication.Entities;
using Domain.Categories.Entities;
using Domain.Comments.Entities;
using Domain.Dishes.Entities;
using Domain.Images.Entities;
using Domain.Users.Entities;
using Microsoft.EntityFrameworkCore;

namespace Domain;

internal sealed class SneakFitDbContext(DbContextOptions<SneakFitDbContext> options) : DbContext(options)
{
    internal DbSet<User> Users => Set<User>();
    internal DbSet<Dish> Dishes => Set<Dish>();
    internal DbSet<Favorited> Favorited => Set<Favorited>();
    internal DbSet<Image> Images => Set<Image>();
    internal DbSet<Ingredient> Ingredients => Set<Ingredient>();
    internal DbSet<Category> Categories => Set<Category>();
    internal DbSet<Comment> Comments => Set<Comment>();
    internal DbSet<Step> Steps => Set<Step>();
    internal DbSet<RefreshToken> RefreshTokens { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SneakFitDbContext).Assembly);

        modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);
        modelBuilder.Entity<Dish>().HasQueryFilter(d => !d.IsDeleted);
        modelBuilder.Entity<Ingredient>().HasQueryFilter(i => !i.IsDeleted);
        modelBuilder.Entity<Category>().HasQueryFilter(c => !c.IsDeleted);
        modelBuilder.Entity<Comment>().HasQueryFilter(c => !c.IsDeleted);
        modelBuilder.Entity<Favorited>().HasQueryFilter(f => !f.IsDeleted);
        modelBuilder.Entity<Image>().HasQueryFilter(f => !f.IsDeleted);
        modelBuilder.ApplyConfiguration(new RefreshTokenConfiguration());
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateAuditFields();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateAuditFields()
    {
        var entries = ChangeTracker.Entries<EntityBase>()
            .Where(e => e.State is EntityState.Modified or EntityState.Added);

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Modified)
            {
                entry.Entity.GetType()
                    .GetMethod("MarkAsUpdated", BindingFlags.NonPublic | BindingFlags.Instance)
                    ?.Invoke(entry.Entity, null);
            }
        }
    }
}