using api.AppInfrastructure;
using api.GQL;
using api.Helpers;
using api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.Identity.Web;

var builder = WebApplication.CreateBuilder(args);
BmtEnvironments.CurrentEnvironment = builder.Configuration["AppConfiguration:Environment"] ?? "CI";
Console.WriteLine($"Loading config for: {BmtEnvironments.CurrentEnvironment}");

builder.AddBmtAzureAppConfiguration();
builder.ConfigureBmtDatabase();
builder.AddBmtAppInsights();
builder.ConfigureBmtLogging();

builder.Services.AddBmtCorsPolicy();
builder.Services.AddRouting(options => options.LowercaseUrls = true);

builder.Services.AddGraphQLServer()
       .AddProjections()
       .AddAuthorization()
       .AddFiltering()
       .AddQueryType<GraphQuery>()
       .AddMutationType<Mutation>();

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.ConfigureBmtSwagger();

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
});

builder.AddBmtAuthentication();
builder.Services.AddBmtAuthorization();

builder.Services.AddBmtIocConfiguration();

builder.Services.AddErrorFilter<ErrorFilter>();

builder.Services.AddHealthChecks().AddCheck<EvaluationService>("ModelsFromDB");

var app = builder.Build();

app.Logger.LogInformation("Starting application...");

if (BmtEnvironments.ShowDebugInfo)
{
    app.Logger.LogInformation($"Configuring for {app.Environment.EnvironmentName} environment");
    app.UseDeveloperExceptionPage();

    var option = new RewriteOptions();
    app.UseRewriter(option);
}
else
{
    app.Logger.LogInformation("Configuring for production environment");
}

app.UseRouting();

app.UseSwagger();

app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "api v1");
    c.OAuthAppName("Fusion-BMT");
    c.OAuthClientId(builder.Configuration["AzureAd:ClientId"]);

    c.OAuthAdditionalQueryStringParams(new Dictionary<string, string>
                                           { { "resource", $"{builder.Configuration["AzureAd:ClientId"]}" } });
});

app.UseCors(BmtCorsPolicyConfiguration.AccessControlPolicyName);

app.UseAuthentication();
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseAuthorization();

app.MapHealthChecks("/health").AllowAnonymous();
app.MapGraphQL();
app.MapControllers();

Console.WriteLine($"Application started with {BmtEnvironments.CurrentEnvironment} config");
app.Run();
