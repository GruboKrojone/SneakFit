using Core.Authentication;
using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Dishes.Repositories;
using Domain.Users.Repositories;
using MediatR;
using Serilog;

namespace Domain.Dishes.Commands;

public record UnmarkDishFavoriteCommand(int DishId) : ICommand<Unit>;

internal sealed class UnmarkDishFavoriteCommandHandler(
    IDishRepository dishRepository,
    IFavoritedRepository favoritedRepository,
    IUserContext userContext,
    IUnitOfWork unitOfWork,
    ILogger logger) : ICommandHandler<UnmarkDishFavoriteCommand, Unit>
{
    public async Task<Unit> Handle(UnmarkDishFavoriteCommand request, CancellationToken cancellationToken)
    {
        var userId = userContext.UserId
            ?? throw new DomainException("User is not authenticated", (int)CommonErrorCode.Unauthorized);

        var dish = await dishRepository.FindAsync(request.DishId, cancellationToken)
            ?? throw new DomainException("Dish not found", (int)CommonErrorCode.EntityNotFound);

        var favorited = await favoritedRepository.FindAsync(
            f => f.UserId == userId && f.DishId == request.DishId,
            cancellationToken);

        if (!favorited.Any())
        {
            logger.Warning("Dish {DishId} is not in favorites for user {UserId}", request.DishId, userId);
            return Unit.Value;
        }

        var favoritedToRemove = favorited.First();

        favoritedRepository.Delete(favoritedToRemove);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        logger.Information("Successfully removed dish {DishId} from favorites for user {UserId}", request.DishId, userId);

        return Unit.Value;
    }
}