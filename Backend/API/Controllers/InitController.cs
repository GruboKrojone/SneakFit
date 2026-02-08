using Domain.Init.Commands;
using Domain.Users.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("init")]
public class InitController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public bool Get() => true;

    [HttpGet]
    [Route("restrict")]
    [Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Employee)},{nameof(UserRole.User)}")]
    public bool GetRestrict() => true;

    [HttpPost]
    [AllowAnonymous]
    [Route("seedUsers")]
    public async Task<Unit> SeedUsers(CancellationToken cancellationToken)
        => await mediator.Send(new SeedUsersCommand(), cancellationToken);
}