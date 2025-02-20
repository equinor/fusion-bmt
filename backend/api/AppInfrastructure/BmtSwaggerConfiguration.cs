using api.Swagger;
using Microsoft.OpenApi.Models;

namespace api.AppInfrastructure;

public static class BmtSwaggerConfiguration
{
    public static void ConfigureBmtSwagger(this WebApplicationBuilder builder)
    {
        builder.Services.AddSwaggerGen(c =>
        {
            c.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.OAuth2,
                Flows = new OpenApiOAuthFlows
                {
                    Implicit = new OpenApiOAuthFlow
                    {
                        TokenUrl = new Uri(
                            $"{builder.Configuration["AzureAd:Instance"]}/{builder.Configuration["AzureAd:TenantId"]}/oauth2/token"),
                        AuthorizationUrl =
                            new Uri(
                                $"{builder.Configuration["AzureAd:Instance"]}/{builder.Configuration["AzureAd:TenantId"]}/oauth2/authorize"),
                        Scopes =
                        {
                            {
                                $"api://{builder.Configuration["AzureAd:ClientId"]}/user_impersonation",
                                "User Impersonation"
                            }
                        }
                    }
                }
            });

            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme()
                    {
                        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "oauth2" }
                    },
                    Array.Empty<string>()
                }
            });
            c.DocumentFilter<GraphEndpoint>();
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "api", Version = "v1" });
        });
    }
}
