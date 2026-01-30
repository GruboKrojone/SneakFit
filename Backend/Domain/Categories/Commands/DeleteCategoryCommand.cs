using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Categories.Repositories;
using MediatR;

namespace Domain.Categories.Commands;

public record DeleteCategoryCommand(int Id) : ICommand<Unit>;

internal class DeleteCategoryCommandHandler(
    ICategoryRepository categoryRepository,
    IUnitOfWork unitOfWork
) : ICommandHandler<DeleteCategoryCommand, Unit>
{
    public async Task<Unit> Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
    {
        if (request is null)
            throw new DomainException("Request is empty", (int)CommonErrorCode.InvalidOperation);

        var category = await categoryRepository.FindAsync(request.Id, cancellationToken);

        categoryRepository.Delete(category);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
