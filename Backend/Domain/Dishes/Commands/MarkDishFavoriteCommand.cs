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

        var existingFavorite = await favoritedRepository.FindIncludingDeletedAsync(
            f => f.UserId == userId && f.DishId == command.Id,
            cancellationToken);

        if (existingFavorite != null)
        {
            if (existingFavorite.IsDeleted)
            {
                // Restore the soft-deleted favorite
                existingFavorite.Restore();
                favoritedRepository.Update(existingFavorite);
                await unitOfWork.SaveChangesAsync(cancellationToken);

                logger.Information("Restored soft-deleted favorite. Dish {DishId} marked as favorite for user {UserId}", command.Id, userId);
            }
            else
            {
                logger.Warning("Dish {DishId} is already a favorite for user {UserId}", command.Id, userId);
            }

            return Unit.Value;
        }

        // Create new favorite relationship
        var favoriteDish = new Favorited(userId, dish.Id);
        favoritedRepository.Add(favoriteDish);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        logger.Information("Successfully saved changes. Dish {DishId} marked as favorite for user {UserId}", command.Id, userId);

        return Unit.Value;
    }
}