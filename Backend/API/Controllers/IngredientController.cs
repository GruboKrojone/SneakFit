using Domain.Dishes.Commands;
using Domain.Dishes.Dto;
using Domain.Users.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("ingredient")]
[Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Employee)},{nameof(UserRole.User)}")]
public class IngredientController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    [Route("add")]
    public async Task<Unit> AddIngredient(IngredientParams @params, CancellationToken cancellationToken)
        => await mediator.Send(new AddIngredientCommand(@params), cancellationToken);

    [HttpPost]
    [Route("{id}/assignToDish/{dishId}")]
    public async Task<Unit> AssignIngredientToDish(int id, int dishId, CancellationToken cancellationToken)
        => await mediator.Send(new AssignIngredientToDishCommand(id, dishId), cancellationToken);

    [HttpDelete]
    [Route("{id}/unassignFromDish/{dishId}")]
    public async Task<Unit> UnassignIngredientFromDish(int id, int dishId, CancellationToken cancellationToken)
        => await mediator.Send(new UnassignIngredientFromDishCommand(id, dishId), cancellationToken);
}
