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
        var dish = await dbContext.Dishes
            .Include(d => d.Categories)
            .FirstOrDefaultAsync(d => d.Id == command.DishId, cancellationToken)
            ?? throw new DomainException("Dish not found", (int)CommonErrorCode.EntityNotFound);

        var categoryExists = await dbContext.Categories
            .AnyAsync(c => c.Id == command.CategoryId, cancellationToken);

        if (!categoryExists)
            throw new DomainException("Category not found", (int)CommonErrorCode.EntityNotFound);

        if (dish.Categories.Any(c => c.Id == command.CategoryId))
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return Unit.Value;
        }

        var category = await dbContext.Categories.FindAsync([command.CategoryId], cancellationToken);

        if (category != null)
            dish.Categories.Add(category);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}