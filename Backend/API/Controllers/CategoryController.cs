using Domain.Categories.Commands;
using Domain.Dishes.Dto;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("category")]
[Authorize(Roles = "Admin")]
public class CategoryController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    [Route("add")]
    public async Task<Unit> AddCategory(CategoryRequest request, CancellationToken cancellationToken)
        => await mediator.Send(new AddCategoryCommand(request), cancellationToken);

    [HttpDelete]
    [Route("{id}/delete")]
    public async Task<Unit> DeleteCategory(int id, CancellationToken cancellationToken)
        => await mediator.Send(new DeleteCategoryCommand(id), cancellationToken);
}
