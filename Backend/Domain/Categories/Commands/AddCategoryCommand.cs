using Core.Authentication;
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
    IUserContext userContext,
    IUnitOfWork unitOfWork) : ICommandHandler<AddCategoryCommand, Unit>
{
    public async Task<Unit> Handle(AddCategoryCommand request, CancellationToken cancellationToken)
    {
        var userId = userContext.UserId
            ?? throw new DomainException("Nobody is authenticated", (int)CommonErrorCode.Unauthorized);

        if (categoryRepository.AnyAsync(c => c.NameEn == request.CategoryRequest.NameEn, cancellationToken).Result)
            throw new DomainException("Category with the same name already exists.", (int)CommonErrorCode.InvalidOperation);

        Category category = new(
            request.CategoryRequest.NameEn, 
            request.CategoryRequest.NamePl, 
            request.CategoryRequest.NameDe, 
            request.CategoryRequest.NameEs, 
            request.CategoryRequest.Color);

        categoryRepository.Add(category);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}