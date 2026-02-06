using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Dishes.Dto;
using Domain.Dishes.Entities;
using Domain.Dishes.Repositories;
using MediatR;

namespace Domain.Dishes.Commands;

public record AddIngredientCommand(IngredientParams Params) : ICommand<int>;

internal sealed class AddIngredientCommandHandler(
    IIngredientRepository ingredientRepository,
    IUnitOfWork unitOfWork) : ICommandHandler<AddIngredientCommand, int>
{
    public async Task<int> Handle(AddIngredientCommand command, CancellationToken cancellationToken)
    {
        var ingredient = new Ingredient(command.Params.Name, command.Params.Description);

        ingredientRepository.Add(ingredient);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ingredient.Id;
    }
}