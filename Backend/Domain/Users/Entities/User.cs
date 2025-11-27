using System.ComponentModel.DataAnnotations;
using Core.Database;
using Domain.Dishes.Entities;
using Domain.Users.Enums;
using Microsoft.EntityFrameworkCore;

namespace Domain.Users.Entities;

sealed class User : EntityBase
{
    private User() { }

    public User(
        string email,
        byte[] passwordHash,
        byte[] passwordSalt,
        UserRole role,
        string name,
        int? age)
    {
        Email = email;
        PasswordHash = passwordHash;
        PasswordSalt = passwordSalt;
        Role = role;
        Name = name;
        Age = age;
    }


    [EmailAddress]
    [Required]
    [MaxLength(100)]
    public string Email { get; private set; }
    public byte[] PasswordHash { get; private set; }
    public byte[]? PasswordSalt { get; private set; }
    public UserRole Role { get; private set; }
    [MaxLength(100)] public string Name { get; private set; }
    public int? Age { get; private set; }
    public ICollection<Dish> FavoriteDishes { get; set; } = new List<Dish>();


    public static void OnModelCreating(ModelBuilder builder)
    {
        builder.Entity<User>().HasKey(x => x.Id);
        builder.Entity<User>().HasIndex(x => x.Email).IsUnique();

        builder.Entity<User>()
        .HasMany(u => u.FavoriteDishes)
        .WithMany(d => d.FavoritedByUsers)
        .UsingEntity(j => j.ToTable("UserFavouriteDishes"));
    }
}