using Domain.Dishes.Entities;
using Domain.Users.Entities;
using Microsoft.EntityFrameworkCore;

namespace Domain;

class SneakFitDbContext : DbContext
{
    public SneakFitDbContext(DbContextOptions<SneakFitDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Dish> Dishes { get; set; }
    public DbSet<Ingredient> Ingredients { get; set; }
    public DbSet<Category> Categories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        User.OnModelCreating(modelBuilder);
        Dish.OnModelCreating(modelBuilder);
        Ingredient.OnModelCreating(modelBuilder);
        Category.OnModelCreating(modelBuilder);
    }
}