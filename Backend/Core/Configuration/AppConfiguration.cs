using Microsoft.Extensions.Configuration;

namespace Core.Configuration;

public class AppConfiguration(IConfiguration configuration) : IAppConfiguration { }