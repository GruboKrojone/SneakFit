using Autofac;
using Domain.Dishes.Repositories;

namespace Domain.Dishes;

internal class DishesModule : Module
{
    protected override void Load(ContainerBuilder builder)
    {
        base.Load(builder);

        builder.RegisterType<DishRepository>().AsImplementedInterfaces();
    }
}