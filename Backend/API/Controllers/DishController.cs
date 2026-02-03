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

    [HttpGet]
    [Route("/dishes")]
    public async Task<IEnumerable<DishCutDto>> GetDishes(CancellationToken cancellationToken)
        => await mediator.Send(new GetDishesQuery(), cancellationToken);

    [HttpPost]
    [Route("{id}/favorite")]
    public async Task<Unit> MarkDishAsFavorite(int id, CancellationToken cancellationToken)
        => await mediator.Send(new MarkDishFavoriteCommand(id), cancellationToken);

    [HttpDelete]
    [Route("{id}/delete")]
    public async Task<Unit> DeleteDish(int id, CancellationToken cancellationToken)
        => await mediator.Send(new DeleteDishCommand(id), cancellationToken);

    [HttpGet]
    [Route("recommended")]
    public async Task<IEnumerable<DishCutDto>> GetRecommendedDishes(int maxResults = 10, CancellationToken cancellationToken = default)
        => await mediator.Send(new GetRecommendedDishesQuery(maxResults), cancellationToken);

    [HttpPost]
    [Route("{dishId}/addStep")]
    public async Task<Unit> AddCookingStep(int dishId, CookingStepParams @params, CancellationToken cancellationToken)
        => await mediator.Send(new AddCookingStepCommand(dishId, @params), cancellationToken);

    [HttpPut]
    [Route("/step/{stepId}/update")]
    public async Task<Unit> UpdateCookingStep(int stepId, CookingStepParams @params, CancellationToken cancellationToken)
        => await mediator.Send(new UpdateCookingStepCommand(stepId, @params), cancellationToken);

    [HttpGet]
    [Route("{dishId}/steps")]
    public async Task<IEnumerable<CookingStepDto>> GetCookingSteps(int dishId, CancellationToken cancellationToken)
        => await mediator.Send(new GetCookingStepsQuery(dishId), cancellationToken);

    [HttpDelete]
    [Route("/step/{stepId}/delete")]
    public async Task<Unit> DeleteCookingStep(int stepId, CancellationToken cancellationToken)
        => await mediator.Send(new DeleteCookingStepCommand(stepId), cancellationToken);

    [HttpPut]
    [Route("{dishId}/rate")]
    public async Task<Unit> RateDish(int dishId, decimal rating, CancellationToken cancellationToken)
        => await mediator.Send(new RateDishCommand(dishId, rating), cancellationToken);
}