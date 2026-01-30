using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Dishes.Repositories;
using Domain.Images.Repositories;
using MediatR;

namespace Domain.Images.Commands;

public record AssignImagesToDishCommand(int DishId, int MainId, int? SecondId, int? ThirdId) : ICommand<Unit>;

internal class AssignImagesToDishCommandHandler(
    IDishRepository dishRepository,
    IImageRepository imageRepository,
    IUnitOfWork unitOfWork) : ICommandHandler<AssignImagesToDishCommand, Unit>
{
    public async Task<Unit> Handle(AssignImagesToDishCommand request, CancellationToken cancellationToken)
    {
        var dish = await dishRepository.FindAsync(request.DishId, cancellationToken)
            ?? throw new DomainException("Dish not found", (int)CommonErrorCode.EntityNotFound);

        var mainImage = await imageRepository.FindAsync(request.MainId, cancellationToken)
            ?? throw new DomainException("Main image not found", (int)CommonErrorCode.EntityNotFound);

        var secondImage = request.SecondId.HasValue
            ? await imageRepository.FindAsync(request.SecondId.Value, cancellationToken)
            : null;
        var thirdImage = request.ThirdId.HasValue
            ? await imageRepository.FindAsync(request.ThirdId.Value, cancellationToken)
            : null;

        dish.AssignImages(mainImage.Id, secondImage?.Id, thirdImage?.Id);
        dishRepository.Update(dish);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return await Unit.Task;
    }
}