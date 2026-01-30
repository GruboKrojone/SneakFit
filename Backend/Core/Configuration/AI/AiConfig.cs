namespace Core.Configuration.AI;

public class AiConfig : IAiConfig
{
    public string BaseUrl { get; init; } = string.Empty;
    public string ApiKey { get; init; } = string.Empty;
}
