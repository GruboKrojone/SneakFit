using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Domain.Dishes.Commands;

public record UnassignIngredientFromDishCommand(int IngredientId, int DishId) : ICommand<Unit>;

internal class UnassignIngredientFromDishCommandHandler(
    SneakFitDbContext dbContext,
    IUnitOfWork unitOfWork) : ICommandHandler<UnassignIngredientFromDishCommand, Unit>
{
    public async Task<Unit> Handle(UnassignIngredientFromDishCommand command, CancellationToken cancellationToken)
    {
        var dish = await dbContext.Dishes
            .Include(d => d.Ingredients)
            .FirstOrDefaultAsync(d => d.Id == command.DishId, cancellationToken)
            ?? throw new DomainException("Dish not found", (int)CommonErrorCode.EntityNotFound);

        var ingredient = dish.Ingredients.FirstOrDefault(i => i.Id == command.IngredientId)
            ?? throw new DomainException("Ingredient not assigned to this dish", (int)CommonErrorCode.EntityNotFound);

        dish.Ingredients.Remove(ingredient);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}