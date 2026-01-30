using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Core.Authentication;
using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Authentication.Enums;
using Domain.Images.Entities;
using Domain.Images.Repositories;
using Microsoft.Extensions.Configuration;

namespace Domain.Images.Commands;

public record UploadImageCommand(Stream FileStream, string FileName, string ContentType) : ICommand<string>;

internal class UploadImageCommandHandler(
    IImageRepository imageRepository,
    IUnitOfWork unitOfWork,
    IUserContext userContext,
    BlobServiceClient blobServiceClient,
    IConfiguration configuration) : ICommandHandler<UploadImageCommand, string>
{
    private readonly string _containerName = configuration["App:Azure:ContainerName"] ?? "images";

    public async Task<string> Handle(UploadImageCommand request, CancellationToken cancellationToken)
    {
        var containerClient = blobServiceClient.GetBlobContainerClient(_containerName);
        await containerClient.CreateIfNotExistsAsync(cancellationToken: cancellationToken);

        var blobName = $"{Guid.NewGuid()}{Path.GetExtension(request.FileName)}";
        var blobClient = containerClient.GetBlobClient(blobName);

        var ownerId = userContext.UserId
            ?? throw new DomainException("Nobody is authenticated", (int)AuthErrorCode.InvalidData);

        Image image = new(
            blobClient.Uri.ToString(),
            ownerId
            );

        imageRepository.Add(image);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        await blobClient.UploadAsync(
            request.FileStream,
            new BlobHttpHeaders { ContentType = request.ContentType },
            cancellationToken: cancellationToken);

        return blobClient.Uri.ToString();
    }
}