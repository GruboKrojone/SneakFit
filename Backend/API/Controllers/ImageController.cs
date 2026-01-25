using Domain.Images.Commands;
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
}