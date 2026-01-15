using Core.Database;
using Domain.Comments.Entities;
using Domain.Dishes.Entities;
using Domain.Users.Enums;

namespace Domain.Users.Entities;

public sealed class User : EntityBase
{
    public string Email { get; private set; }
    public string Password { get; private set; }
    public UserRole Role { get; private set; }
    public string Name { get; private set; }
    public int? Age { get; private set; }
    public Lang Lang { get; private set; }
    public ICollection<Dish> FavoriteDishes { get; private set; }
    public ICollection<Comment> Comments { get; private set; }


    private User()
    {
        Email = string.Empty;
        Password = string.Empty;
        Name = string.Empty;
        Lang = Lang.EN;
        FavoriteDishes = [];
    }

    public User(
        string email,
        string password,
        UserRole role,
        string name,
        int? age) : this()
    {
        Email = email;
        Password = password;
        Role = role;
        Name = name;
        Age = age;
    }

    public void SetApplicationLang(Lang lang)
    {
        Lang = lang;
        MarkAsUpdated();
    }

    public void UpdateProfile(string name, int? age)
    {
        Name = name;
        Age = age;
        MarkAsUpdated();
    }
}