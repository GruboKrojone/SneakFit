using Core.Database;
using Domain.Comments.Entities;
using Microsoft.EntityFrameworkCore;

namespace Domain.Comments.Repositories;

internal class CommentRepository(SneakFitDbContext dbContext) : EntityRepositoryBase<Comment>(dbContext), ICommentRepository
{
    protected override IQueryable<Comment> GetQuery()
        => dbContext.Comments.AsQueryable()
            .Include(c => c.Author);
}
