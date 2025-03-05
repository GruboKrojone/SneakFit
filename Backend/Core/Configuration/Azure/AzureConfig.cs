namespace Core.Configuration.Azure;

public class AzureConfig : IAzureConfig
{
    public string ConnectionString { get; init; } = string.Empty;
    public string ContainerName { get; init; } = string.Empty;
}