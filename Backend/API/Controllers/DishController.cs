using Domain.Dishes.Commands;
using Domain.Dishes.Dto;
using Domain.Dishes.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("dish")]
public class DishController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    [Route("add")]
    public async Task<Unit> AddDish(AddDishParams @params, CancellationToken cancellationToken)
        => await mediator.Send(new AddDishCommand(@params), cancellationToken);
    
    [HttpGet]
    [Route("{dishId}")]
    public async Task<DishDetails> DishDetailsQuery(int dishId, CancellationToken cancellationToken)
        => await mediator.Send(new DishDetailsQuery(dishId), cancellationToken);
}