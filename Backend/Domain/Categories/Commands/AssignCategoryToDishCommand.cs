using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Domain.Categories.Commands;

public record AssignCategoryToDishCommand(int CategoryId, int DishId) : ICommand<Unit>;

internal class AssignCategoryToDishCommandHandler(
    IUnitOfWork unitOfWork,
    SneakFitDbContext dbContext) : ICommandHandler<AssignCategoryToDishCommand, Unit>
{
    public async Task<Unit> Handle(AssignCategoryToDishCommand command, CancellationToken cancellationToken)
    {
        var dishExists = await dbContext.Dishes
            .AnyAsync(d => d.Id == command.DishId, cancellationToken);

        if (!dishExists)
            throw new DomainException("Dish not found", (int)CommonErrorCode.EntityNotFound);

        var categoryExists = await dbContext.Categories
            .AnyAsync(c => c.Id == command.CategoryId, cancellationToken);

        if (!categoryExists)
            throw new DomainException("Category not found", (int)CommonErrorCode.EntityNotFound);

        var relationshipExists = await dbContext.Dishes
            .Where(d => d.Id == command.DishId)
            .SelectMany(d => d.Categories)
            .AnyAsync(c => c.Id == command.CategoryId, cancellationToken);

        if (relationshipExists)
            return Unit.Value;

        var dish = await dbContext.Dishes
            .Include(d => d.Categories)
            .FirstAsync(d => d.Id == command.DishId, cancellationToken);

        var category = await dbContext.Categories
            .FirstAsync(c => c.Id == command.CategoryId, cancellationToken);

        dish.Categories.Add(category);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}