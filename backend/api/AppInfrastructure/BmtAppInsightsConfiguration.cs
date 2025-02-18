using Microsoft.ApplicationInsights.AspNetCore.Extensions;

namespace api.AppInfrastructure;

public static class BmtAppInsightsConfiguration
{
    public static void AddBmtAppInsights(this WebApplicationBuilder builder)
    {
        var appInsightTelemetryOptions = new ApplicationInsightsServiceOptions
        {
            ConnectionString = builder.Configuration["ApplicationInsightInstrumentationConnectionString"]
        };

        builder.Services.AddApplicationInsightsTelemetry(appInsightTelemetryOptions);
    }
}
