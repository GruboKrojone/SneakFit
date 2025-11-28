using Domain.Users.Commands;
using Domain.Users.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("user/")]
public class UserController(IMediator mediator) : ControllerBase
{
    [HttpPut]
    [Route("{id}/lang")]
    public async Task<Unit> SetUserLang(int id, Lang lang, CancellationToken cancellationToken)
        => await mediator.Send(new SetUserLangCommand(id, lang), cancellationToken);
}
