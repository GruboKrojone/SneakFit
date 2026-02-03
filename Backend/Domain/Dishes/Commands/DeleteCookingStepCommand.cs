using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Dishes.Repositories;
using MediatR;

namespace Domain.Dishes.Commands;

public record DeleteCookingStepCommand(int StepId) : ICommand<Unit>;

internal class DeleteCookingStepCommandHandler(
    IStepRepository stepRepository,
    IUnitOfWork unitOfWork) : ICommandHandler<DeleteCookingStepCommand, Unit>
{
    public async Task<Unit> Handle(DeleteCookingStepCommand request, CancellationToken cancellationToken)
    {
        var step = await stepRepository.FindAsync(request.StepId, cancellationToken)
            ?? throw new DomainException("Step not found", (int)CommonErrorCode.EntityNotFound);

        stepRepository.Delete(step);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}