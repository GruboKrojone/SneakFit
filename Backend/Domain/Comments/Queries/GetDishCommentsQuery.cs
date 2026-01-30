using Core.CQRS;
using Core.Middlewares;
using Domain.Comments.Dtos;
using Domain.Comments.Repositories;

namespace Domain.Comments.Queries;

public record GetDishCommentsQuery(int DishId) : IQuery<List<CommentDto>>;

internal sealed class GetDishCommentsQueryHandler(
    ICommentRepository commentRepository) : IQueryHandler<GetDishCommentsQuery, List<CommentDto>>
{
    public async Task<List<CommentDto>> Handle(GetDishCommentsQuery request, CancellationToken cancellationToken)
    {
        var comments = await commentRepository.FindAsync(c => c.DishId == request.DishId, cancellationToken)
            ?? throw new DomainException("No dishes found", (int)CommonErrorCode.EntityNotFound);

        return [.. comments.Select(x => x.ToDto())];
    }
}