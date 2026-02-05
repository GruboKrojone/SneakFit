using Domain.Authentication.Commands;
using Domain.Authentication.Dto;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("auth")]
[AllowAnonymous]
public class AuthController(IMediator mediator) : ControllerBase
{
    [HttpPost]

    [Route("login")]
    public async Task<LoginResponse> Login(LoginParams @params, CancellationToken cancellationToken)
        => await mediator.Send(new LoginCommand(@params), cancellationToken);

    [HttpPost]
    [Route("register")]
    public async Task<int> Register(RegisterParams @params, CancellationToken cancellationToken)
        => await mediator.Send(new RegisterCommand(@params), cancellationToken);

    [HttpPost]
    [Route("refresh")]
    public async Task<LoginResponse> RefreshToken(RefreshTokenParams @params, CancellationToken cancellationToken)
        => await mediator.Send(new RefreshTokenCommand(@params), cancellationToken);

    [HttpPost]
    [Route("revoke")]
    public async Task<Unit> RevokeToken(RefreshTokenParams @params, CancellationToken cancellationToken)
        => await mediator.Send(new RevokeTokenCommand(@params), cancellationToken);
}