using Autofac;
using Autofac.Extensions.DependencyInjection;
using Core.Configuration;
using Core.Configuration.Azure;
using Core.Middlewares.Exceptions;
using Domain;
using Microsoft.OpenApi.Models;

namespace API;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        
        ConfigureDependencyInjection(builder);
        
        builder.Services.AddAuthorization();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "SneakFit API", Version = "v1" });
            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                In = ParameterLocation.Header,
                Description = "Please enter JWT with Bearer into field",
                Name = "Authorization",
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer"
            });
            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });
        builder.Services.AddControllers();
        
        var env = builder.Environment;
        builder.Configuration
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true)
            .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true, reloadOnChange: true)
            .AddEnvironmentVariables();
        
        var azureConfig = new AzureConfig();
        builder.Services.AddSingleton<IAzureConfig>(azureConfig);

        var app = builder.Build();
        
        app.UseMiddleware<ExceptionMiddleware>();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "SneakFit API v1");
            });
        }

        app.UseHttpsRedirection();
        app.UseAuthorization();
        app.MapControllers();
        
        
        using (var scope = app.Services.CreateScope())
        {
            DomainModule.MigrateDatabase(scope);
        }
        
        
        app.Run();
    }
    
    private static void ConfigureDependencyInjection(WebApplicationBuilder appBuilder)
    {
        appBuilder.Host.UseServiceProviderFactory(new AutofacServiceProviderFactory());
        appBuilder.Host.ConfigureContainer<ContainerBuilder>(containerBuilder =>
        {
            containerBuilder.RegisterModule(new DomainModule(appBuilder.Configuration));
            containerBuilder.RegisterInstance(new AppConfiguration(appBuilder.Configuration))
                .As<IAppConfiguration>().SingleInstance();
        });
    }

}