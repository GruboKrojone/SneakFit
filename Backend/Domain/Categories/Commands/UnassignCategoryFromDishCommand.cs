using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Domain.Categories.Commands;

public record UnassignCategoryFromDishCommand(int CategoryId, int DishId) : ICommand<Unit>;

internal class UnassignCategoryFromDishCommandHandler(
    SneakFitDbContext dbContext,
    IUnitOfWork unitOfWork) : ICommandHandler<UnassignCategoryFromDishCommand, Unit>
{
    public async Task<Unit> Handle(UnassignCategoryFromDishCommand command, CancellationToken cancellationToken)
    {
        var dish = await dbContext.Dishes
            .Include(d => d.Categories)
            .FirstOrDefaultAsync(d => d.Id == command.DishId, cancellationToken)
            ?? throw new DomainException("Dish not found", (int)CommonErrorCode.EntityNotFound);

        var category = dish.Categories.FirstOrDefault(c => c.Id == command.CategoryId)
            ?? throw new DomainException("Category not assigned to this dish", (int)CommonErrorCode.EntityNotFound);

        dish.Categories.Remove(category);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}