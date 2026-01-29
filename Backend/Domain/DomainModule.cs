using System.Reflection;
using Autofac;
using Core.Database;
using Core.Middlewares;
using Domain.Authentication;
using Domain.Comments;
using Domain.Dishes;
using Domain.Images;
using Domain.Users;
using MediatR.Extensions.Autofac.DependencyInjection;
using MediatR.Extensions.Autofac.DependencyInjection.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
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
        builder.RegisterModule<CommentsModule>();
        builder.RegisterModule<ImagesModule>();

        builder.RegisterType<UnitOfWork>().As<IUnitOfWork>().InstancePerLifetimeScope();

        RegisterDatabaseProviders(builder);
        RegisterMediator(builder);
    }

    public static void MigrateDatabase(ILifetimeScope scope, IServiceProvider serviceProvider)
    {
        var logger = serviceProvider.GetRequiredService<ILogger<DomainModule>>();

        try
        {
            logger.LogInformation("Starting database migration...");

            var dbContext = scope.Resolve<SneakFitDbContext>();

            if (dbContext.Database.GetPendingMigrations().Any())
            {
                logger.LogInformation("Applying pending migrations...");
                dbContext.Database.Migrate();
                logger.LogInformation("Database migration completed successfully.");
            }
            else
                logger.LogInformation("No pending migrations found.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Database migration failed: {ErrorMessage}", ex.Message);
            throw;
        }
    }

    private void RegisterDatabaseProviders(ContainerBuilder builder)
    {
        var connectionString = configuration.GetConnectionString(ConnectionStringName);

        if (string.IsNullOrWhiteSpace(connectionString))
            throw new DomainException(
                "Cannot find connection string for database",
                (int)CommonErrorCode.InvalidOperation);

        builder
            .Register(c =>
            {
                var optionsBuilder = new DbContextOptionsBuilder<SneakFitDbContext>();

                optionsBuilder.UseSqlServer(
                    connectionString,
                    sqlOptions =>
                    {
                        sqlOptions.EnableRetryOnFailure(
                            maxRetryCount: 5,
                            maxRetryDelay: TimeSpan.FromSeconds(30),
                            errorNumbersToAdd: null);

                        sqlOptions.CommandTimeout(30);
                        sqlOptions.MigrationsAssembly(typeof(SneakFitDbContext).Assembly.FullName);
                    });

                optionsBuilder.EnableSensitiveDataLogging(false);
                optionsBuilder.EnableDetailedErrors(false);

                return new SneakFitDbContext(optionsBuilder.Options);
            })
            .AsSelf()
            .As<DbContext>()
            .InstancePerLifetimeScope();
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