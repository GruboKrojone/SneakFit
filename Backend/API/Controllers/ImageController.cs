using Domain.Images.Commands;
using Domain.Images.Dto;
using Domain.Images.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("image")]
public class ImageController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<string>> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

        using var stream = file.OpenReadStream();
        var imageUrl = await mediator.Send(new UploadImageCommand(stream, file.FileName, file.ContentType));

        return Ok(new { url = imageUrl });
    }

    [HttpPut]
    [Route("{dishId}/assign")]
    public async Task<Unit> AssignImagesToDish(int dishId, int mainId, int? secondId, int? thirdId, CancellationToken cancellationToken)
        => await mediator.Send(new AssignImagesToDishCommand(dishId, mainId, secondId, thirdId), cancellationToken);

    [HttpGet]
    [Route("{dishId}/main")]
    public async Task<ImageDto> GetMainImage(int dishId, CancellationToken cancellationToken)
        => await mediator.Send(new GetMainImageQuery(dishId), cancellationToken);

    [HttpGet]
    [Route("{dishId}/all")]
    public async Task<List<ImageDto>> GetAllImages(int dishId, CancellationToken cancellationToken)
        => await mediator.Send(new GetAllImagesQuery(dishId), cancellationToken);
}