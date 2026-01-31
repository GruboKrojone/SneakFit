using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Dishes.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Domain.Dishes.Commands;

public record AssignIngredientToDishCommand(int IngredientId, int DishId) : ICommand<Unit>;

internal class AssignIngredientToDishCommandHandler(
    SneakFitDbContext dbContext,
    IIngredientRepository ingredientRepository,
    IUnitOfWork unitOfWork) : ICommandHandler<AssignIngredientToDishCommand, Unit>
{
    public async Task<Unit> Handle(AssignIngredientToDishCommand command, CancellationToken cancellationToken)
    {
        var dish = await dbContext.Dishes
            .Include(d => d.Ingredients)
            .FirstOrDefaultAsync(d => d.Id == command.DishId, cancellationToken)
            ?? throw new DomainException("Dish not found", (int)CommonErrorCode.EntityNotFound);

        var ingredient = await ingredientRepository.FindAsync(command.IngredientId, cancellationToken)
            ?? throw new DomainException("Ingredient not found", (int)CommonErrorCode.EntityNotFound);

        if (!dish.Ingredients.Contains(ingredient))
            dish.Ingredients.Add(ingredient);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}