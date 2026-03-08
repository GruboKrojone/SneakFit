using Core.Database;
using Domain.Comments.Dtos;
using Domain.Dishes.Entities;
using Domain.Users.Entities;

namespace Domain.Comments.Entities;

public sealed class Comment : EntityBase
{
    public string Content { get; private set; }
    public int AuthorId { get; private set; }
    public User Author { get; }
    public int DishId { get; private set; }
    public Dish Dish { get; }

    private Comment()
    {
        Content = string.Empty;
    }

    public Comment(string content, int authorId, int dishId) : this()
    {
        Content = content;
        AuthorId = authorId;
        DishId = dishId;
    }

    public void UpdateContent(string content)
    {
        Content = content;
        MarkAsUpdated();
    }

    public CommentDto ToDto()
        => new(Id, Content, AuthorId, DishId);

}
