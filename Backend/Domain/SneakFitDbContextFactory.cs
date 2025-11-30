using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Domain;

internal sealed class SneakFitDbContextFactory : IDesignTimeDbContextFactory<SneakFitDbContext>
{
    public SneakFitDbContext CreateDbContext(string[] args)
    {
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";

        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: false)
            .AddJsonFile($"appsettings.{environment}.json", optional: true, reloadOnChange: false)
            .AddJsonFile($"appsettings.Local.json", optional: true, reloadOnChange: false)
            .AddUserSecrets<SneakFitDbContextFactory>(optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString(nameof(SneakFitDbContext));

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                $"Connection string '{nameof(SneakFitDbContext)}' not found in configuration. " +
                $"Ensure appsettings.json or User Secrets are configured properly.");
        }

        var optionsBuilder = new DbContextOptionsBuilder<SneakFitDbContext>();
        optionsBuilder.UseSqlServer(
            connectionString,
            sqlOptions =>
            {
                sqlOptions.MigrationsAssembly(typeof(SneakFitDbContext).Assembly.FullName);
                sqlOptions.CommandTimeout(60);
            });

        return new SneakFitDbContext(optionsBuilder.Options);
    }
}