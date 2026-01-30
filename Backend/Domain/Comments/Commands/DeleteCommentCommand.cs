using Core.Authentication;
using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Comments.Repositories;
using MediatR;

namespace Domain.Comments.Commands;

public record DeleteCommentCommand(int CommentId) : ICommand<Unit>;

internal class DeleteCommentCommandHandler(
    ICommentRepository commentRepository,
    IUserContext userContext,
    IUnitOfWork unitOfWork) : ICommandHandler<DeleteCommentCommand, Unit>
{
    public async Task<Unit> Handle(DeleteCommentCommand request, CancellationToken cancellationToken)
    {
        var comment = await commentRepository.FindAsync(request.CommentId, cancellationToken)
            ?? throw new DomainException("Cannot find that comment", (int)CommonErrorCode.InvalidOperation);

        if (comment.AuthorId != userContext.UserId)
            throw new DomainException("Cannot access this comment", (int)CommonErrorCode.InvalidOperation);

        commentRepository.Delete(comment);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}