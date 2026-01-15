using Core.Database;
using Domain.Comments.Entities;

namespace Domain.Comments.Repositories;

internal interface ICommentRepository : IEntityRepository<Comment>
{
}
