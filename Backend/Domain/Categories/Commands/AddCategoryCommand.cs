using Core.Authentication;
using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Categories.Entities;
using Domain.Categories.Repositories;
using Domain.Dishes.Dto;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Domain.Categories.Commands;

public record AddCategoryCommand(CategoryRequest CategoryRequest) : ICommand<Unit>;

internal class AddCategoryCommandHandler(
    ICategoryRepository categoryRepository,
    IUserContext userContext,
    IUnitOfWork unitOfWork) : ICommandHandler<AddCategoryCommand, Unit>
{
    public async Task<Unit> Handle(AddCategoryCommand request, CancellationToken cancellationToken)
    {
        if (userContext.UserId is null)
            throw new DomainException("Nobody is authenticated", (int)CommonErrorCode.Unauthorized);

        if (await categoryRepository.AnyAsync(c => c.NameEn == request.CategoryRequest.NameEn, cancellationToken))
            throw new DomainException("Category with the same name already exists.", (int)CommonErrorCode.InvalidOperation);

        Category category = new(
            request.CategoryRequest.NameEn, 
            request.CategoryRequest.NamePl, 
            request.CategoryRequest.NameDe, 
            request.CategoryRequest.NameEs, 
            request.CategoryRequest.Color);

        categoryRepository.Add(category);
        try
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (InvalidOperationException ex) when (ex.InnerException is DbUpdateException)
        {
            throw new DomainException("Category with the same name already exists.", (int)CommonErrorCode.InvalidOperation);
        }

        return Unit.Value;
    }
}