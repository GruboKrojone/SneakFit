using Autofac;
using Domain.Images.Repositories;

namespace Domain.Images;

internal sealed class ImagesModule : Module
{
    protected override void Load(ContainerBuilder builder)
    {
        base.Load(builder);

        builder.RegisterType<ImageRepository>().AsImplementedInterfaces();
    }
}