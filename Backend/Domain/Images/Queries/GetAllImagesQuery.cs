using Core.CQRS;
using Core.Middlewares;
using Domain.Dishes.Repositories;
using Domain.Images.Dto;
using Domain.Images.Repositories;

namespace Domain.Images.Queries;

public record GetAllImagesQuery(int DishId) : IQuery<List<ImageDto>>;

internal class GetAllImagesQueryHandler(
    IImageRepository imageRepository,
    IDishRepository dishRepository) : IQueryHandler<GetAllImagesQuery, List<ImageDto>>
{
    public async Task<List<ImageDto>> Handle(GetAllImagesQuery request, CancellationToken cancellationToken)
    {
        var dish = await dishRepository.FindAsync(request.DishId, cancellationToken)
            ?? throw new DomainException("Cannot find dish", (int)CommonErrorCode.EntityNotFound);

        var images = new List<ImageDto>();

        if (dish.MainPictureId.HasValue)
        {
            var mainImage = await imageRepository.FindAsync(dish.MainPictureId.Value, cancellationToken);
            images.Add(new ImageDto(mainImage.Id, mainImage.OwnerId, mainImage.Url, ImagePosition.Main));
        }

        if (dish.SecondaryPictureId.HasValue)
        {
            var secondImage = await imageRepository.FindAsync(dish.SecondaryPictureId.Value, cancellationToken);
            images.Add(new ImageDto(secondImage.Id, secondImage.OwnerId, secondImage.Url, ImagePosition.Secondary));
        }

        if (dish.ThirdPictureId.HasValue)
        {
            var thirdImage = await imageRepository.FindAsync(dish.ThirdPictureId.Value, cancellationToken);
            images.Add(new ImageDto(thirdImage.Id, thirdImage.OwnerId, thirdImage.Url, ImagePosition.Third));
        }

        return images;
    }
}