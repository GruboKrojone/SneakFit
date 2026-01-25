using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Core.CQRS;

namespace Domain.Images.Commands;

public record UploadImageCommand(Stream FileStream, string FileName, string ContentType) : ICommand<string>;

internal class UploadImageCommandHandler : ICommandHandler<UploadImageCommand, string>
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly string _containerName;

    public UploadImageCommandHandler(BlobServiceClient blobServiceClient, Microsoft.Extensions.Configuration.IConfiguration configuration)
    {
        _blobServiceClient = blobServiceClient;
        _containerName = configuration["App:Azure:ContainerName"] ?? "images";
    }

    public async Task<string> Handle(UploadImageCommand request, CancellationToken cancellationToken)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
        await containerClient.CreateIfNotExistsAsync(cancellationToken: cancellationToken);

        var blobName = $"{Guid.NewGuid()}{Path.GetExtension(request.FileName)}";
        var blobClient = containerClient.GetBlobClient(blobName);

        await blobClient.UploadAsync(
            request.FileStream,
            new BlobHttpHeaders { ContentType = request.ContentType },
            cancellationToken: cancellationToken);

        return blobClient.Uri.ToString();
    }
}