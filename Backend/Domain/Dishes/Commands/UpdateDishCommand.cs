using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Dishes.Dto;
using Domain.Dishes.Entities;
using Domain.Dishes.Repositories;
using MediatR;

namespace Domain.Dishes.Commands;

public record UpdateDishCommand(int DishId, DishParams Params) : ICommand<DishDto>;

internal class UpdateDishCommandHandler(
    IDishRepository dishRepository,
    IUnitOfWork unitOfWork) : ICommandHandler<UpdateDishCommand, DishDto>
{
    public async Task<DishDto> Handle(UpdateDishCommand command, CancellationToken cancellationToken)
    {
        var input = command.Params;

        var dish = await dishRepository.FindAsync(command.DishId, cancellationToken)
            ?? throw new DomainException($"Dish with name '{input.Name}' not found", 
                (int)CommonErrorCode.EntityNotFound);

        dish.Update(
            input.Name,
            input.Description ?? dish.Description,
            input.Calories ?? dish.Calories,
            input.Protein ?? dish.Protein,
            input.Carbs ?? dish.Carbs,
            input.Fat ?? dish.Fat
        );

        dishRepository.Update(dish);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dishDto = dish.ToDto();
        
        return dishDto;
    }
}