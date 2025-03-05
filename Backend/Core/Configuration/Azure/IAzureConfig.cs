namespace Core.Configuration.Azure;

public interface IAzureConfig
{
    string ConnectionString { get; init; }
    string ContainerName { get; init; }
}