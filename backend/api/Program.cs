using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

using System;

namespace api
{
    public static class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureLogging(
                    builder =>
                    {
                        var appInsightKey = Environment.GetEnvironmentVariable("ApplicationInsights__InstrumentationKey");
                        if (!String.IsNullOrEmpty(appInsightKey))
                        {
                            builder.AddApplicationInsights(appInsightKey);
                            builder.AddFilter<Microsoft.Extensions.Logging.ApplicationInsights.ApplicationInsightsLoggerProvider>
                                (typeof(Program).FullName, LogLevel.Information);
                        }
                        builder.AddFilter<Microsoft.Extensions.Logging.Console.ConsoleLoggerProvider>
                            (typeof(Program).FullName, LogLevel.Information);
                    }
                )
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}
