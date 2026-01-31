using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Dishes.Dto;
using Domain.Dishes.Entities;
using Domain.Dishes.Repositories;
using MediatR;

namespace Domain.Dishes.Commands;

public record AddCookingStepCommand(int DishId, CookingStepParams StepParams) : ICommand<Unit>;

internal class AddCookingStepCommandHandler(
    IDishRepository dishRepository,
    IStepRepository stepRepository,
    IUnitOfWork unitOfWork) : ICommandHandler<AddCookingStepCommand, Unit>
{
    public async Task<Unit> Handle(AddCookingStepCommand request, CancellationToken cancellationToken)
    {
        var dish = await dishRepository.FindAsync(request.DishId, cancellationToken)
            ?? throw new DomainException($"Dish with id {request.DishId} not found.", (int)CommonErrorCode.InvalidOperation);

        var cookingStep = new Step(
            request.StepParams.StepName,
            request.StepParams.StepDescription,
            dish.Steps.Count + 1,
            dish.Id);

        stepRepository.Add(cookingStep);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}