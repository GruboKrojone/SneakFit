namespace Domain.Images.Dto;

public record ImageDto(int ImageId, int OwnerId, string Url, ImagePosition Position);