using Serilog;

namespace api.AppInfrastructure;

public static class BmtLogConfiguration
{
    public static void ConfigureBmtLogging(this WebApplicationBuilder builder)
    {
        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Debug()
            .ReadFrom.Configuration(builder.Configuration)
            .Enrich.WithMachineName()
            .Enrich.WithProperty("Environment", BmtEnvironments.CurrentEnvironment)
            .Enrich.FromLogContext()
            .CreateBootstrapLogger();

        builder.Host.UseSerilog();
    }
}
