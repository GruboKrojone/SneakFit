using Autofac;
using Domain.Authentication.Repositories;
using Domain.Authentication.Services;

namespace Domain.Authentication;

public sealed class AuthenticationModule : Module
{
    protected override void Load(ContainerBuilder builder)
    {
        builder.RegisterType<AuthService>().As<IAuthService>().InstancePerLifetimeScope();
        builder.RegisterType<RefreshTokenRepository>().As<IRefreshTokenRepository>().InstancePerLifetimeScope();
    }
}