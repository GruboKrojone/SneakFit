using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Categories.Entities;
using Domain.Categories.Repositories;
using Domain.Dishes.Dto;
using MediatR;

namespace Domain.Categories.Commands;

public record AddCategoryCommand(CategoryRequest CategoryRequest) : ICommand<Unit>;

internal class AddCategoryCommandHandler(
    ICategoryRepository categoryRepository,
    IUnitOfWork unitOfWork) : ICommandHandler<AddCategoryCommand, Unit>
{
    public async Task<Unit> Handle(AddCategoryCommand request, CancellationToken cancellationToken)
    {
        if (categoryRepository.AnyAsync(c => c.Name == request.CategoryRequest.Name, cancellationToken).Result)
            throw new DomainException("Category with the same name already exists.", (int)CommonErrorCode.InvalidOperation);

        Category category = new(request.CategoryRequest.Name);

        categoryRepository.Add(category);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}