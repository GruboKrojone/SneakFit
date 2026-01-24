using Domain.AI.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("ai")]
public class AiController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    [Route("send")]
    public async Task<string> GetAiResponse(string message, CancellationToken cancellationToken)
        => await mediator.Send(new GetAiResponseQuery(message), cancellationToken);
}
