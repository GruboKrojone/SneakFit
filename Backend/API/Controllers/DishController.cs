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
    public async Task<Unit> AddDish(DishParams @params, CancellationToken cancellationToken)
        => await mediator.Send(new AddDishCommand(@params), cancellationToken);
    
    [HttpPut]
    [Route("{dishId}/public")]
    public async Task<Unit> MakeDishPublic(int dishId, CancellationToken cancellationToken)
        => await mediator.Send(new MakeDishPublicCommand(dishId), cancellationToken);
        
    [HttpGet]
    [Route("{dishId}")]
    public async Task<DishDetails> DishDetailsQuery(int dishId, CancellationToken cancellationToken)
        => await mediator.Send(new DishDetailsQuery(dishId), cancellationToken);

    [HttpPut]
    [Route("{dishId}/update")]
    public async Task<DishDto> UpdateDish(int dishId, DishParams @params, CancellationToken cancellationToken)
        => await mediator.Send(new UpdateDishCommand(dishId, @params), cancellationToken);
}