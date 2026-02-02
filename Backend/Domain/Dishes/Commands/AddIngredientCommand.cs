using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Dishes.Dto;
using Domain.Dishes.Entities;
using Domain.Dishes.Repositories;
using MediatR;

namespace Domain.Dishes.Commands;

public record AddIngredientCommand(IngredientParams Params) : ICommand<Unit>;

internal sealed class AddIngredientCommandHandler(
    IIngredientRepository ingredientRepository,
    IUnitOfWork unitOfWork) : ICommandHandler<AddIngredientCommand, Unit>
{
    public async Task<Unit> Handle(AddIngredientCommand command, CancellationToken cancellationToken)
    {
        var ingredient = new Ingredient(command.Params.Name, command.Params.Description);

        var isExisting = await ingredientRepository
            .AnyAsync(i => i.Name == ingredient.Name, cancellationToken);

        if (isExisting)
            throw new DomainException("Ingredient already exists in db", (int)CommonErrorCode.EntityAlreadyExists);

        ingredientRepository.Add(ingredient);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}