using Microsoft.Extensions.Configuration;

namespace Core.Configuration;

public class AppConfiguration(IConfiguration configuration) : IAppConfiguration
{
    private readonly IConfiguration _configuration = configuration;
}