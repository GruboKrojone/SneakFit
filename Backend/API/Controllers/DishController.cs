using Domain.Dishes.Commands;
using Domain.Dishes.Dto;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("dish")]
public class DishController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    [Route("add")]
    public async Task<Unit> AddDish(DishParams @params, CancellationToken cancellationToken)
        => await mediator.Send(new AddDishCommand(@params), cancellationToken);

    [HttpPut]
    [Route("{dishId}/update")]
    public async Task<DishDto> UpdateDish(int dishId, DishParams @params, CancellationToken cancellationToken)
        => await mediator.Send(new UpdateDishCommand(dishId, @params), cancellationToken);
}