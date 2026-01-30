using Autofac;
using Domain.Comments.Repositories;

namespace Domain.Comments;

internal sealed class CommentsModule : Module
{
    protected override void Load(ContainerBuilder builder)
    {
        base.Load(builder);

        builder.RegisterType<CommentRepository>().AsImplementedInterfaces();
    }
}