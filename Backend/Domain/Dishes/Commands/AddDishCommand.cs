using Core.Authentication;
using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Dishes.Dto;
using Domain.Dishes.Entities;
using Domain.Dishes.Repositories;
using MediatR;

namespace Domain.Dishes.Commands;

public record AddDishCommand(DishParams Params) : ICommand<int>;

internal sealed class AddDishCommandHandler(
    IDishRepository dishRepository,
    IUserContext userContext,
    IUnitOfWork unitOfWork) : ICommandHandler<AddDishCommand, int>
{
    public async Task<int> Handle(AddDishCommand command, CancellationToken cancellationToken)
    {
        var input = command.Params;

        var userId = userContext.UserId
                     ?? throw new DomainException("Nobody is authenticated", (int)CommonErrorCode.Unauthorized);

        var dish = new Dish(
            input.Name,
            input.Description ?? null,
            input.Calories ?? null,
            input.Protein ?? null,
            input.Carbs ?? null,
            input.Fat ?? null,
            input.IsPublic
        );
        dish.AssignToUser(userId);

        dishRepository.Add(dish);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return dish.Id;
    }
}