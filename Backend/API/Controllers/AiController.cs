using Domain.AI.Dto;
using Domain.AI.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("ai")]
public class AiController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    [Route("ask")]
    public async Task<string> GetAiResponse([FromBody] AiGeneratedDishProperties props, CancellationToken cancellationToken)
        => await mediator.Send(new GetAiResponseQuery(props), cancellationToken);
}
