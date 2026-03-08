using Domain.Categories.Commands;
using Domain.Categories.Dto;
using Domain.Categories.Queries;
using Domain.Dishes.Dto;
using Domain.Users.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("category")]
public class CategoryController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    [Route("/categories")]
    public async Task<IEnumerable<CategoryDto>> GetAllCategories(CancellationToken cancellationToken)
        => await mediator.Send(new GetAllCategoriesQuery(), cancellationToken);

    [HttpPost]
    [Route("add")]
    [Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Employee)}")]
    public async Task<Unit> AddCategory(CategoryRequest request, CancellationToken cancellationToken)
        => await mediator.Send(new AddCategoryCommand(request), cancellationToken);

    [HttpDelete]
    [Route("{id}/delete")]
    [Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Employee)}")]
    public async Task<Unit> DeleteCategory(int id, CancellationToken cancellationToken)
        => await mediator.Send(new DeleteCategoryCommand(id), cancellationToken);

    [HttpPost]
    [Route("{id}/assignToDish/{dishId}")]
    [Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Employee)},{nameof(UserRole.User)}")]
    public async Task<Unit> AssignCategoryToDish(int id, int dishId, CancellationToken cancellationToken)
        => await mediator.Send(new AssignCategoryToDishCommand(id, dishId), cancellationToken);

    [HttpPut]
    [Route("{id}/unassignFromDish/{dishId}")]
    [Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Employee)},{nameof(UserRole.User)}")]
    public async Task<Unit> UnassignCategoryFromDish(int id, int dishId, CancellationToken cancellationToken)
        => await mediator.Send(new UnassignCategoryFromDishCommand(id, dishId), cancellationToken);
}