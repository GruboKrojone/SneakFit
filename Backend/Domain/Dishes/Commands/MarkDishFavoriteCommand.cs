using Core.Authentication;
using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Dishes.Repositories;
using Domain.Users.Entities;
using Domain.Users.Repositories;
using MediatR;
using Serilog;

namespace Domain.Dishes.Commands;

public record MarkDishFavoriteCommand(int Id) : ICommand<Unit>;

internal sealed class MarkDishAsFavoriteCommandHandler(
    IDishRepository dishRepository,
    IUserRepository userRepository,
    IFavoritedRepository favoritedRepository,
    IUserContext userContext,
    IUnitOfWork unitOfWork,
    ILogger logger) : ICommandHandler<MarkDishFavoriteCommand, Unit>
{
    public async Task<Unit> Handle(MarkDishFavoriteCommand command, CancellationToken cancellationToken)
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

        var favoriteDish = new Favorited(userId, dish.Id);

        favoritedRepository.Add(favoriteDish);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        logger.Information("Successfully saved changes. Dish {DishId} marked as favorite for user {UserId}", command.Id, user.Id);
        logger.Information("New count: {Count} for userId: {UserId}", user.FavoriteDishes.Count, user.Id);

        return Unit.Value;
    }
}