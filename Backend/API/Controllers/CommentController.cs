using Domain.Comments.Commands;
using Domain.Comments.Dtos;
using Domain.Comments.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("comment")]
public class CommentController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    [Route("{dishId}/add")]
    public async Task<CommentDto> AddComment(int dishId, [FromBody] string content, CancellationToken cancellationToken)
        => await mediator.Send(new AddCommentCommand(dishId, content), cancellationToken);

    [HttpPut]
    [Route("{commentId}/edit")]
    public async Task<CommentDto> EditComment(int commentId, [FromBody] string content, CancellationToken cancellationToken)
        => await mediator.Send(new EditCommentCommand(commentId, content), cancellationToken);

    [HttpDelete]
    [Route("{commentId}/delete")]
    public async Task<Unit> DeleteComment(int commentId, CancellationToken cancellationToken)
        => await mediator.Send(new DeleteCommentCommand(commentId), cancellationToken);

    [HttpGet]
    [Route("{dishId}/all")]
    public async Task<List<CommentDto>> GetCommentsByDish(int dishId, CancellationToken cancellationToken)
        => await mediator.Send(new GetDishCommentsQuery(dishId), cancellationToken);
}
