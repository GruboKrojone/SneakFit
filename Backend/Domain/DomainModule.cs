using System.Reflection;
using Autofac;
using Core.Database;
using Core.Middlewares;
using Domain.Authentication;
using Domain.Dishes;
using Domain.Users;
using MediatR.Extensions.Autofac.DependencyInjection;
using MediatR.Extensions.Autofac.DependencyInjection.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Module = Autofac.Module;

namespace Domain;

public class DomainModule(IConfigurationRoot configuration) : Module
{
    private const string ConnectionStringName = nameof(SneakFitDbContext);

    protected override void Load(ContainerBuilder builder)
    {
        base.Load(builder);

        builder.RegisterInstance(configuration).As<IConfigurationRoot>();
        builder.RegisterModule<UsersModule>();
        builder.RegisterModule<AuthenticationModule>();
        builder.RegisterModule<DishesModule>();

        builder.RegisterType<UnitOfWork>().As<IUnitOfWork>().InstancePerLifetimeScope();

        RegisterDatabaseProviders(builder);
        RegisterMediator(builder);
    }

    public static void MigrateDatabase(IServiceScope scope)
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<SneakFitDbContext>();
        dbContext.Database.Migrate();
    }

    private void RegisterDatabaseProviders(ContainerBuilder builder)
    {
        builder
            .Register(_ =>
            {
                var optionsBuilder = new DbContextOptionsBuilder<SneakFitDbContext>();
                var connectionString = configuration.GetConnectionString(ConnectionStringName);

                if (connectionString != null)
                    optionsBuilder.UseSqlServer(connectionString);
                else
                    throw new DomainException("Cannot find connection string for db",
                        (int)CommonErrorCode.InvalidOperation);

                return new SneakFitDbContext(optionsBuilder.Options);
            })
            .As<DbContext>()
            .AsSelf()
            .InstancePerDependency();
    }

    private static void RegisterMediator(ContainerBuilder builder)
    {
        var mediatorConfiguration = MediatRConfigurationBuilder
            .Create(Assembly.GetExecutingAssembly())
            .WithAllOpenGenericHandlerTypesRegistered()
            .WithRegistrationScope(RegistrationScope.Scoped)
            .Build();

        builder.RegisterMediatR(mediatorConfiguration);
    }
}