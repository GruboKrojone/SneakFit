using Autofac;
using Domain.Categories.Repositories;

namespace Domain.Categories;

internal sealed class CategoriesModule : Module
{
    protected override void Load(ContainerBuilder builder)
    {
        base.Load(builder);

        builder.RegisterType<CategoryRepository>().AsImplementedInterfaces();
    }
}