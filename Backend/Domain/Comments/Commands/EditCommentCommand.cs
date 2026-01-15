using Core.Authentication;
using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Comments.Dtos;
using Domain.Comments.Repositories;

namespace Domain.Comments.Commands;

public record EditCommentCommand(int CommentId, string Content) : ICommand<CommentDto>;

internal class EditCommentCommandHandler(
    ICommentRepository commentRepository,
    IUserContext userContext,
    IUnitOfWork unitOfWork) : ICommandHandler<EditCommentCommand, CommentDto>
{
    public async Task<CommentDto> Handle(EditCommentCommand request, CancellationToken cancellationToken)
    {
        var comment = await commentRepository.FindAsync(request.CommentId, cancellationToken)
            ?? throw new DomainException("Cannot find that comment", (int)CommonErrorCode.InvalidOperation);

        if (comment.AuthorId != userContext.UserId)
            throw new DomainException("Cannot access this comment", (int)CommonErrorCode.Unauthorized);

        if (string.IsNullOrWhiteSpace(request.Content))
            return comment.ToDto();

        comment.UpdateContent(request.Content);
        commentRepository.Update(comment);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return comment.ToDto();
    }
}