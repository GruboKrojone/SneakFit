using Core.Authentication;
using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Dishes.Repositories;
using Domain.Users.Repositories;
using MediatR;
using Serilog;

namespace Domain.Dishes.Commands;

public record MarkDishFavouriteCommand(int Id) : ICommand<Unit>;

internal sealed class MarkDishAsFavouriteCommandHandler(
    IDishRepository dishRepository,
    IUserRepository userRepository,
    IUserContext userContext,
    IUnitOfWork unitOfWork,
    ILogger logger) : ICommandHandler<MarkDishFavouriteCommand, Unit>
{
    public async Task<Unit> Handle(MarkDishFavouriteCommand command, CancellationToken cancellationToken)
    {
        var userId = userContext.UserId
            ?? throw new DomainException("User is not authenticated", (int)CommonErrorCode.Unauthorized);

        var user = await userRepository.FindAsync(userId, cancellationToken)
            ?? throw new DomainException("User not found", (int)CommonErrorCode.EntityNotFound);

        var dish = await dishRepository.FindAsync(command.Id, cancellationToken)
            ?? throw new DomainException("Dish not found", (int)CommonErrorCode.EntityNotFound);

        if (user.FavoriteDishes.Any(d => d.Id == command.Id))
        {
            logger.Warning("Dish {DishId} is already a favorite for user {UserId}", command.Id, user.Id);
            return Unit.Value;
        }

        user.FavoriteDishes.Add(dish);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        logger.Information("Successfully saved changes. Dish {DishId} marked as favourite for user {UserId}", command.Id, user.Id);
        logger.Information("New count: {Count} for userId: {UserId}", user.FavoriteDishes.Count, user.Id);

        return Unit.Value;
    }
}