namespace Domain.Comments.Dtos;

public record CommentDto(
    string Content,
    int AuthorId,
    int DishId);
