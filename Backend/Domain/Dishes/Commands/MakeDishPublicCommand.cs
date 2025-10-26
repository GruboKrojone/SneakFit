using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Dishes.Repositories;
using MediatR;

namespace Domain.Dishes.Commands;

public record MakeDishPublicCommand(int DishId) : ICommand<Unit>;

internal class MakeDishPublicCommandHandler(
    IDishRepository dishRepository,
    IUnitOfWork unitOfWork) : ICommandHandler<MakeDishPublicCommand, Unit>
{
    public async Task<Unit> Handle(MakeDishPublicCommand request, CancellationToken cancellationToken)
    {
        var dish = await dishRepository.FindAsync(request.DishId, cancellationToken)
                   ?? throw new DomainException($"Dish with provided ID {request.DishId} does not exists",
                       (int)CommonErrorCode.EntityNotFound);

        dish.MarkAsPublic();
        dishRepository.Update(dish);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}