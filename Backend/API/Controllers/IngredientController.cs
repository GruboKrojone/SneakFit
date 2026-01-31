using Domain.Dishes.Commands;
using Domain.Dishes.Dto;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("ingredient")]
public class IngredientController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    [Route("add")]
    public async Task<Unit> AddIngredient(IngredientParams @params, CancellationToken cancellationToken)
        => await mediator.Send(new AddIngredientCommand(@params), cancellationToken);
}
