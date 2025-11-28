using Autofac;
using Domain.Dishes.Repositories;

namespace Domain.Dishes;

sealed class DishesModule : Module
{
    protected override void Load(ContainerBuilder builder)
    {
        base.Load(builder);

        builder.RegisterType<DishRepository>().AsImplementedInterfaces();
        builder.RegisterType<IngredientRepository>().AsImplementedInterfaces();
        builder.RegisterType<CategoryRepository>().AsImplementedInterfaces();
    }
}