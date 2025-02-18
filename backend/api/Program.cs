using System.Globalization;
using api.AppInfrastructure;
using api.GQL;
using api.Helpers;
using api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.Identity.Web;

var cultureInfo = new CultureInfo("en-US");

CultureInfo.DefaultThreadCurrentCulture = cultureInfo;
CultureInfo.DefaultThreadCurrentUICulture = cultureInfo;

var builder = WebApplication.CreateBuilder(args);
BmtEnvironments.CurrentEnvironment = builder.Configuration["AppConfiguration:Environment"] ?? "CI";
Console.WriteLine($"Loading config for: {BmtEnvironments.CurrentEnvironment}");

builder.AddBmtAzureAppConfiguration();
builder.ConfigureBmtDatabase();
builder.AddBmtAppInsights();
builder.ConfigureBmtLogging();

builder.Services.AddBmtCorsPolicy();
builder.Services.AddRouting(options => options.LowercaseUrls = true);
// builder.Services.AddControllers(options => options.Conventions.Add(new RouteTokenTransformerConvention(new DcdApiEndpointTransformer())));

builder.Services.AddGraphQLServer()
    .AddProjections()
    .AddAuthorization()
    .AddFiltering()
    .AddQueryType<GraphQuery>()
    .AddMutationType<Mutation>();

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.ConfigureBmtSwagger();

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));

builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

builder.Services.AddBmtIocConfiguration();


builder.Services.AddErrorFilter<ErrorFilter>();


builder.Services.AddHealthChecks().AddCheck<EvaluationService>("ModelsFromDB");

// builder.Services.AddSwaggerGen(c =>
// {
//     c.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
//     {
//         Type = SecuritySchemeType.OAuth2,
//         Flows = new OpenApiOAuthFlows
//         {
//             Implicit = new OpenApiOAuthFlow
//             {
//                 TokenUrl = new Uri(
//                     $"{builder.Configuration["AzureAd:Instance"]}/{builder.Configuration["AzureAd:TenantId"]}/oauth2/token"),
//                 AuthorizationUrl =
//                     new Uri(
//                         $"{builder.Configuration["AzureAd:Instance"]}/{builder.Configuration["AzureAd:TenantId"]}/oauth2/authorize"),
//                 Scopes =
//                 {
//                     { $"api://{builder.Configuration["AzureAd:ClientId"]}/user_impersonation", "User Impersonation" }
//                 }
//             }
//         }
//     });
//
//     c.AddSecurityRequirement(new OpenApiSecurityRequirement
//     {
//         {
//             new OpenApiSecurityScheme()
//             {
//                 Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "oauth2" }
//             },
//             Array.Empty<string>()
//         }
//     });
//     c.DocumentFilter<GraphEndpoint>();
//     c.SwaggerDoc("v1", new OpenApiInfo { Title = "api", Version = "v1" });
// });

var app = builder.Build();

app.Logger.LogInformation("Starting application...");

if (app.Environment.IsDevelopment() || app.Environment.EnvironmentName == "Test")
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

app.Run();
