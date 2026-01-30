using Core.Authentication;
using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Dishes.Repositories;
using Domain.Users.Repositories;
using MediatR;

namespace Domain.Dishes.Commands;

public record MakeDishPublicCommand(int DishId) : ICommand<Unit>;

internal sealed class MakeDishPublicCommandHandler(
    IDishRepository dishRepository,
    IUserRepository userRepository,
    IUserContext userContext,
    IUnitOfWork unitOfWork) : ICommandHandler<MakeDishPublicCommand, Unit>
{
    public async Task<Unit> Handle(MakeDishPublicCommand request, CancellationToken cancellationToken)
    {
        var userId = userContext.UserId ?? throw new DomainException("User is not authenticated",
            (int)CommonErrorCode.Unauthorized);

        var dish = await dishRepository.FindAsync(request.DishId, cancellationToken)
                   ?? throw new DomainException($"Dish with provided ID {request.DishId} does not exists",
                       (int)CommonErrorCode.EntityNotFound);

        if (!userRepository.IsOperationAllowed(userId, dish.Id))
            throw new DomainException("User is not allowed to make this dish public",
                (int)CommonErrorCode.Unauthorized);

        dish.MarkAsPublic();
        dishRepository.Update(dish);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}