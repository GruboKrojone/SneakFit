using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Dishes.Dto;
using Domain.Dishes.Repositories;
using MediatR;

namespace Domain.Dishes.Commands;

public record UpdateCookingStepCommand(int StepId, CookingStepParams Params) : ICommand<Unit>;

internal class UpdateCookingStepCommandHandler(IStepRepository stepRepository,
    IUnitOfWork unitOfWork) : ICommandHandler<UpdateCookingStepCommand, Unit>
{
    public async Task<Unit> Handle(UpdateCookingStepCommand request, CancellationToken cancellationToken)
    {
        var step = await stepRepository.FindAsync(request.StepId, cancellationToken)
            ?? throw new DomainException("Cooking step not found!", (int)CommonErrorCode.EntityNotFound);

        step.Update(request.Params.StepName, request.Params.StepDescription);
        stepRepository.Update(step);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}