using Core.Authentication;
using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Dishes.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Domain.Dishes.Commands;

public record RateDishCommand(int DishId, decimal Rating) : ICommand<Unit>;

internal sealed class RateDishCommandHandler(
    SneakFitDbContext dbContext,
    IUserContext userContext,
    IUnitOfWork unitOfWork) : ICommandHandler<RateDishCommand, Unit>
{
    public async Task<Unit> Handle(RateDishCommand command, CancellationToken cancellationToken)
    {
        var userId = userContext.UserId
            ?? throw new DomainException("User is not authenticated", (int)CommonErrorCode.Unauthorized);

        if (command.Rating < 0 || command.Rating > 5)
            throw new DomainException("Rating must be between 0 and 5", (int)CommonErrorCode.InvalidOperation);

        var dish = await dbContext.Dishes
            .Include(d => d.Ratings)
            .FirstOrDefaultAsync(d => d.Id == command.DishId, cancellationToken)
            ?? throw new DomainException("Dish not found", (int)CommonErrorCode.EntityNotFound);

        var existingRating = dish.Ratings.FirstOrDefault(r => r.UserId == userId);

        if (existingRating != null)
        {
            existingRating.SetRating(command.Rating);
        }
        else
        {
            var newRating = new DishRating(userId, command.DishId, command.Rating);
            dish.Ratings.Add(newRating);
        }

        dish.RecalculateAverageRating();

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}