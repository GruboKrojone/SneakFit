namespace Core.Configuration.Azure;

public interface IAzureConfig
{
    public string ConnectionString { get; init; }
    public string ContainerName { get; init; }
}