using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Algorithm;
using Autofac;
using Autofac.Extensions.DependencyInjection;
using Core.Authentication;
using Core.Configuration;
using Core.Configuration.Azure;
using Core.Configuration.JWT;
using Core.Middlewares.Exceptions;
using Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;

namespace API;

internal static class Program
{
    public static void Main(string[] args)
    {
        Console.Clear();

        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Information()
            .WriteTo.Console()
            .CreateBootstrapLogger();

        try
        {
            Log.Information("Starting web application");

            var builder = WebApplication.CreateBuilder(args);

            var env = builder.Environment;
            builder.Configuration
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true, reloadOnChange: true)
                .AddEnvironmentVariables();

            builder.Host.UseSerilog((context, services, configuration) => configuration
                .ReadFrom.Configuration(context.Configuration)
                .Enrich.FromLogContext()
                .Enrich.WithProperty("Environment", context.HostingEnvironment.EnvironmentName));

            ConfigureDependencyInjection(builder);

            var authenticationSettings = new AuthenticationSettings();
            var azureConfig = new AzureConfig();
            builder.Configuration.GetSection("App:Authentication").Bind(authenticationSettings);
            builder.Configuration.GetSection("App:Azure").Bind(azureConfig);

            ConfigureServices(builder, authenticationSettings, azureConfig);

            var app = builder.Build();

            ConfigureMiddleware(app);

            var autofacContainer = app.Services.GetAutofacRoot();
            using (var scope = autofacContainer.BeginLifetimeScope())
            {
                DomainModule.MigrateDatabase(scope, app.Services);
            }

            Log.Information("Application started successfully");
            app.Run();
        }
        catch (Exception ex)
        {
            Log.Fatal(ex, "Application terminated unexpectedly");
            throw;
        }
        finally
        {
            Log.CloseAndFlush();
        }
    }

    private static void ConfigureServices(
        WebApplicationBuilder builder,
        AuthenticationSettings authenticationSettings,
        AzureConfig azureConfig)
    {
        const string Bearer = "Bearer";

        builder.Services.AddHttpContextAccessor();
        builder.Services.AddScoped<IUserContext, UserContext>();
        builder.Services.AddSingleton<IAuthenticationSettings>(authenticationSettings);
        builder.Services.AddSingleton<IAzureConfig>(azureConfig);
        builder.Services.AddSingleton<DishRecommendationAlgorithm>();

        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = Bearer;
            options.DefaultScheme = Bearer;
            options.DefaultChallengeScheme = Bearer;
        }).AddJwtBearer(cfg =>
        {
            cfg.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
            cfg.SaveToken = true;
            cfg.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = authenticationSettings.JwtIssuer,
                ValidAudience = authenticationSettings.JwtIssuer,
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(authenticationSettings.JwtKey)),
                ClockSkew = TimeSpan.Zero
            };
        });

        builder.Services.AddAuthorization();

        var allowedOrigins = builder.Configuration
            .GetSection("App:Cors:AllowedOrigins")
            .Get<string[]>() ?? ["https://localhost:5173"];

        builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                policy.WithOrigins(allowedOrigins)
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .AllowCredentials();
            });
        });

        builder.Services.AddRateLimiter(options =>
        {
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: context.User.Identity?.Name ?? context.Request.Headers.Host.ToString(),
                    factory: partition => new FixedWindowRateLimiterOptions
                    {
                        AutoReplenishment = true,
                        PermitLimit = 100,
                        QueueLimit = 0,
                        Window = TimeSpan.FromMinutes(1)
                    }));

            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
        });

        builder.Services.AddControllers().AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.Converters.Add(
                new JsonStringEnumConverter());
            options.JsonSerializerOptions.DefaultIgnoreCondition =
                JsonIgnoreCondition.WhenWritingNull;
        });

        builder.Services.AddEndpointsApiExplorer();

        builder.Services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "SneakFit API",
                Version = "v1",
                Description = "Modern fitness application API"
            });
            c.UseInlineDefinitionsForEnums();
            c.AddSecurityDefinition(Bearer, new OpenApiSecurityScheme
            {
                In = ParameterLocation.Header,
                Description = "Please enter JWT with Bearer into field",
                Name = "Authorization",
                Type = SecuritySchemeType.ApiKey,
                Scheme = Bearer,
                BearerFormat = "JWT"
            });
            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = Bearer
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });

        builder.Services.AddHealthChecks()
            .AddCheck("database", () =>
            {
                try
                {
                    using var scope = builder.Services.BuildServiceProvider().CreateScope();
                    var autofacContainer = scope.ServiceProvider.GetRequiredService<ILifetimeScope>();
                    var dbContext = autofacContainer.Resolve<DbContext>();

                    var canConnect = dbContext.Database.CanConnect();
                    return canConnect
                        ? HealthCheckResult.Healthy("Database is reachable")
                        : HealthCheckResult.Unhealthy("Database is not reachable");
                }
                catch (Exception ex)
                {
                    return HealthCheckResult.Unhealthy("Database health check failed", ex);
                }
            }, tags: ["db", "sql"]);
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

    private static void ConfigureMiddleware(WebApplication app)
    {
        app.UseSerilogRequestLogging();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "SneakFit API v1");
                c.RoutePrefix = string.Empty;
            });
        }

        app.Use(async (context, next) =>
        {
            context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
            context.Response.Headers.Append("X-Frame-Options", "DENY");
            context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
            context.Response.Headers.Append("Referrer-Policy", "no-referrer");

            if (!app.Environment.IsDevelopment())
            {
                context.Response.Headers.Append("Content-Security-Policy", "default-src 'self'");
            }

            await next();
        });

        app.UseMiddleware<ExceptionMiddleware>();
        app.UseHttpsRedirection();
        app.UseRateLimiter();
        app.UseCors();
        app.UseAuthentication();
        app.UseAuthorization();

        app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
        {
            ResponseWriter = async (context, report) =>
            {
                context.Response.ContentType = "application/json";
                var result = System.Text.Json.JsonSerializer.Serialize(new
                {
                    status = report.Status.ToString(),
                    checks = report.Entries.Select(e => new
                    {
                        name = e.Key,
                        status = e.Value.Status.ToString(),
                        description = e.Value.Description,
                        duration = e.Value.Duration.TotalMilliseconds
                    }),
                    totalDuration = report.TotalDuration.TotalMilliseconds
                });
                await context.Response.WriteAsync(result);
            }
        });

        app.MapControllers();
    }
}