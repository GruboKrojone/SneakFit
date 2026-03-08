using Core.Authentication;
using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Comments.Entities;
using Domain.Comments.Repositories;
using Domain.Dishes.Repositories;
using MediatR;
using Domain.Comments.Dtos;

namespace Domain.Comments.Commands;

public record AddCommentCommand(int DishId, string Content) : ICommand<CommentDto>;

internal sealed class AddCommentCommandHandler(
    ICommentRepository commentRepository,
    IDishRepository dishRepository,
    IUserContext userContext,
    IUnitOfWork unitOfWork) : ICommandHandler<AddCommentCommand, CommentDto>
{
    public async Task<CommentDto> Handle(AddCommentCommand request, CancellationToken cancellationToken)
    {
        var userId = userContext.UserId
                     ?? throw new DomainException("Nobody is authenticated", (int)CommonErrorCode.Unauthorized);

        if (string.IsNullOrWhiteSpace(request.Content))
            throw new DomainException("Content cannot be null", (int)CommonErrorCode.InvalidOperation);

        var dishExists = await dishRepository.AnyAsync(d => d.Id == request.DishId, cancellationToken);

        if (!dishExists)
            throw new DomainException("Dish does not exist", (int)CommonErrorCode.EntityNotFound);

        var exists = await commentRepository.AnyAsync(
            c => c.AuthorId == userId && c.DishId == request.DishId && c.Content == request.Content.Trim(),
            cancellationToken);

        if (exists)
            throw new DomainException("Cannot add same comment", (int)CommonErrorCode.InvalidOperation);

        var comment = new Comment(
            request.Content.Trim(),
            userId,
            request.DishId);

        commentRepository.Add(comment);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return comment.ToDto();

    }
}