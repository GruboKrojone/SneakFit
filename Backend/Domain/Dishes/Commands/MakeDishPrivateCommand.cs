using Core.Authentication;
using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Dishes.Repositories;
using Domain.Users.Repositories;
using MediatR;

namespace Domain.Dishes.Commands;

public record MakeDishPrivateCommand(int DishId) : ICommand<Unit>;

internal sealed class MakeDishPrivateCommandHandler(
    IDishRepository dishRepository,
    IUserRepository userRepository,
    IUserContext userContext,
    IUnitOfWork unitOfWork) : ICommandHandler<MakeDishPrivateCommand, Unit>
{
    public async Task<Unit> Handle(MakeDishPrivateCommand request, CancellationToken cancellationToken)
    {
        var userId = userContext.UserId ?? throw new DomainException("User is not authenticated",
            (int)CommonErrorCode.Unauthorized);

        var dish = await dishRepository.FindAsync(request.DishId, cancellationToken)
                   ?? throw new DomainException($"Dish with provided ID {request.DishId} does not exists",
                       (int)CommonErrorCode.EntityNotFound);

        if (!userRepository.IsOperationAllowed(userId, dish.Id))
            throw new DomainException("User is not allowed to make this dish private",
                (int)CommonErrorCode.Unauthorized);

        dish.MarkAsPrivate();
        dishRepository.Update(dish);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
