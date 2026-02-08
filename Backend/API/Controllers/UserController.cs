using Domain.Users.Commands;
using Domain.Users.Dtos;
using Domain.Users.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("user/")]
[Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Employee)},{nameof(UserRole.User)}")]
public class UserController(IMediator mediator) : ControllerBase
{
    [HttpPut]
    [Route("{id}/lang")]
    public async Task<Unit> SetUserLang(int id, Lang lang, CancellationToken cancellationToken)
        => await mediator.Send(new SetUserLangCommand(id, lang), cancellationToken);

    [HttpPut]
    [Route("{id}/settings")]
    public async Task<Unit> SetUserSettings(int id, UserSettings settings, CancellationToken cancellationToken)
        => await mediator.Send(new SetUserSettingsCommand(id, settings), cancellationToken);
}
