using Domain.Authentication.Commands;
using Domain.Authentication.Dto;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("auth")]
public class AuthController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    [Route("register")]
    [AllowAnonymous]
    public async Task<int> Register(RegisterParams registerParams, CancellationToken cancellationToken)
        => await mediator.Send(new RegisterCommand(registerParams), cancellationToken);
    
    [HttpPost, Route("login")]
    public Task<LoginResponse> Login(LoginParams loginParams, CancellationToken cancellationToken)
        => mediator.Send(new LoginCommand(loginParams), cancellationToken);
}