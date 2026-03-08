namespace Domain.Comments.Dtos;

public record CommentDto(
    int CommentId,
    string Content,
    int AuthorId,
    int DishId);
