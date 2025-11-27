using Core.Authentication;
using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Dishes.Repositories;
using Domain.Users.Repositories;
using MediatR;

namespace Domain.Dishes.Commands;

public record DeleteDishCommand(int DishId) : ICommand<Unit>;

sealed class DeleteDishCommandHandler(
    IDishRepository dishRepository,
    IUnitOfWork unitOfWork,
    IUserContext userContext,
    IUserRepository userRepository) : ICommandHandler<DeleteDishCommand, Unit>
{
    public async Task<Unit> Handle(DeleteDishCommand command, CancellationToken cancellationToken)
    {
        var userId = userContext.UserId ??
            throw new DomainException("Log in please!", (int)CommonErrorCode.Unauthorized);

        var dishId = command.DishId;
        var dish = await dishRepository.FindAsync(dishId, cancellationToken);

        if (userRepository.IsOperationAllowed(userId, dishId))
        {
            dishRepository.Delete(dish);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return await Task.FromResult(Unit.Value);
        }

        return await Task.FromResult(Unit.Value);
    }
}
