using Autofac;
using Core.Configuration.AI;
using Domain.Integrations.Gemini;
using Microsoft.Extensions.Configuration;
using Module = Autofac.Module;

namespace Domnain.Integrations.Gemini;

public class IntegrationModule(IConfigurationRoot configuration) : Module
{

    protected override void Load(ContainerBuilder builder)
    {
        base.Load(builder);

        var aiConfig = new AiConfig();
        configuration.GetSection("App:AI").Bind(aiConfig);

        builder.RegisterInstance(aiConfig).As<IAiConfig>().SingleInstance();
        builder.RegisterType<Integrate>().As<IAIIntegration>().InstancePerLifetimeScope();

        builder.RegisterType<HttpClient>().AsSelf().InstancePerLifetimeScope();
    }

}