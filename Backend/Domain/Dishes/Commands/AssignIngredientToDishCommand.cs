using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Dishes.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Domain.Dishes.Commands;

public record AssignIngredientToDishCommand(int IngredientId, int DishId) : ICommand<Unit>;

internal class AssignIngredientToDishCommandHandler(
    IDishRepository dishRepository,
    IIngredientRepository ingredientRepository,
    IUnitOfWork unitOfWork,
    SneakFitDbContext dbContext) : ICommandHandler<AssignIngredientToDishCommand, Unit>
{
    public async Task<Unit> Handle(AssignIngredientToDishCommand command, CancellationToken cancellationToken)
    {
        var dish = await dbContext.Dishes
            .Include(d => d.Ingredients)
            .FirstOrDefaultAsync(d => d.Id == command.DishId, cancellationToken)
            ?? throw new DomainException("Dish not found", (int)CommonErrorCode.EntityNotFound);

        var ingredientExists = await dbContext.Ingredients
            .AnyAsync(i => i.Id == command.IngredientId, cancellationToken);

        if (!ingredientExists)
            throw new DomainException("Ingredient not found", (int)CommonErrorCode.EntityNotFound);

        if (dish.Ingredients.Any(i => i.Id == command.IngredientId))
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Unit.Value;
        }

        var ingredient = await dbContext.Ingredients.FindAsync(new object[] { command.IngredientId }, cancellationToken);

        if (ingredient != null)
            dish.Ingredients.Add(ingredient);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}