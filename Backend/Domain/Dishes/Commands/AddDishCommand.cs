using Core.Authentication;
using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Dishes.Dto;
using Domain.Dishes.Entities;
using Domain.Dishes.Repositories;
using MediatR;

namespace Domain.Dishes.Commands;

public record AddDishCommand(AddDishParams Params) : ICommand<Unit>;

internal class AddDishCommandHandler(
    IDishRepository dishRepository,
    IUserContext userContext,
    IUnitOfWork unitOfWork) : ICommandHandler<AddDishCommand, Unit>
{
    public async Task<Unit> Handle(AddDishCommand command, CancellationToken cancellationToken)
    {
        var input = command.Params;

        var userId = userContext.UserId
            ?? throw new DomainException("Nobody is authenticated", (int)CommonErrorCode.Unauthorized);

        var dish = new Dish(
            input.Name,
            input.Description,
            input.Calories,
            input.Protein,
            input.Carbs,
            input.Fat,
            input.IsPublic,
            input.Rates,
            userId
        );

        dishRepository.Add(dish);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}