using Domain.AI.Dto;
using Domain.AI.Queries;
using Domain.Users.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("ai")]
[Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Employee)},{nameof(UserRole.User)}")]
public class AiController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    [Route("ask")]
    public async Task<string> GetAiResponse([FromBody] AiGeneratedDishProperties props, CancellationToken cancellationToken)
        => await mediator.Send(new GetAiResponseQuery(props), cancellationToken);
}