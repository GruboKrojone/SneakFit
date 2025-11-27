using Autofac;
using Domain.Users.Repositories;

namespace Domain.Users;

sealed class UsersModule : Module
{
    protected override void Load(ContainerBuilder builder)
    {
        base.Load(builder);

        builder.RegisterType<UserRepository>().AsImplementedInterfaces();
    }
}