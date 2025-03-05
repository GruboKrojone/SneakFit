using Autofac;
using Domain.Authentication.Services;

namespace Domain.Authentication;

public class AuthenticationModule : Module
{
    protected override void Load(ContainerBuilder builder)
    {
        base.Load(builder);

        builder.RegisterType<AuthService>().AsImplementedInterfaces();
    }
}