using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Categories.Repositories;
using Domain.Dishes.Repositories;
using MediatR;

namespace Domain.Categories.Commands;

public record AssignCategoryToDishCommand(int CategoryId, int DishId) : ICommand<Unit>;

internal class AssignCategoryToDishCommandHandler(
    IDishRepository dishRepository,
    ICategoryRepository categoryRepository,
    IUnitOfWork unitOfWork) : ICommandHandler<AssignCategoryToDishCommand, Unit>
{
    public async Task<Unit> Handle(AssignCategoryToDishCommand command, CancellationToken cancellationToken)
    {
        var dish = await dishRepository.FindAsync(command.DishId, cancellationToken)
            ?? throw new DomainException("Dish not found", (int)CommonErrorCode.EntityNotFound);

        var category = await categoryRepository.FindAsync(command.CategoryId, cancellationToken)
            ?? throw new DomainException("Category not found", (int)CommonErrorCode.EntityNotFound);

        if (!dish.Categories.Contains(category))
            dish.Categories.Add(category);

        dishRepository.Update(dish);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}