using Core.Authentication;
using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Dishes.Dto;
using Domain.Dishes.Repositories;
using Domain.Users.Repositories;

namespace Domain.Dishes.Commands;

public record UpdateDishCommand(int DishId, DishParams Params) : ICommand<DishDto>;

internal sealed class UpdateDishCommandHandler(
    IDishRepository dishRepository,
    IUserRepository userRepository,
    IUserContext userContext,
    IUnitOfWork unitOfWork) : ICommandHandler<UpdateDishCommand, DishDto>
{
    public async Task<DishDto> Handle(UpdateDishCommand command, CancellationToken cancellationToken)
    {
        var userId = userContext.UserId ?? throw new DomainException("Log in please!",
            (int)CommonErrorCode.Unauthorized);
        var input = command.Params;

        var dish = await dishRepository.FindAsync(command.DishId, cancellationToken)
                   ?? throw new DomainException($"Dish with name '{input.Name}' not found",
                       (int)CommonErrorCode.EntityNotFound);

        if (!userRepository.IsOperationAllowed(userId, dish.Id))
            throw new DomainException("User is not allowed to update this dish",
                (int)CommonErrorCode.Unauthorized);

        dish.Update(
            input.Name,
            input.Description ?? dish.Description,
            input.Calories ?? dish.Calories,
            input.Protein ?? dish.Protein,
            input.Carbs ?? dish.Carbs,
            input.Fat ?? dish.Fat,
            input.IsPublic);

        dishRepository.Update(dish);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dishDto = dish.ToDto();
        return dishDto;
    }
}