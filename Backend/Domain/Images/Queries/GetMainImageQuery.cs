using Core.CQRS;
using Core.Middlewares;
using Domain.Dishes.Repositories;
using Domain.Images.Dto;
using Domain.Images.Repositories;

namespace Domain.Images.Queries;

public record GetMainImageQuery(int DishId) : IQuery<ImageDto>;

internal class GetMainImageQueryHandler(
    IImageRepository imageRepository,
    IDishRepository dishRepository) : IQueryHandler<GetMainImageQuery, ImageDto>
{
    public async Task<ImageDto> Handle(GetMainImageQuery request, CancellationToken cancellationToken)
    {
        var dish = await dishRepository.FindAsync(request.DishId, cancellationToken)
            ?? throw new DomainException("Dish not found", (int)CommonErrorCode.EntityNotFound);

        if (!dish.MainPictureId.HasValue)
            throw new DomainException("Dish does not have a main picture", (int)CommonErrorCode.EntityNotFound);

        var image = await imageRepository.FindAsync(dish.MainPictureId.Value, cancellationToken)
            ?? throw new DomainException($"Image with ID {dish.MainPictureId} not found.", (int)CommonErrorCode.EntityNotFound);

        return new ImageDto(image.Id, image.OwnerId, image.Url, ImagePosition.Main);
    }
}