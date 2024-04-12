using Microsoft.AspNetCore.Builder;
using System;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using api.GQL;
using api.Services;
using api.Authorization;
using Azure.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.Sqlite;
using api.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using api.Swagger;
using Microsoft.AspNetCore.Rewrite;
using System.Collections.Generic;
using api.Helpers;
using Microsoft.ApplicationInsights.AspNetCore.Extensions;
using Microsoft.Extensions.Configuration;
using Serilog;

try
{
    var _accessControlPolicyName = "AllowSpecificOrigins";
    SqliteConnection _connectionToInMemorySqlite = null;

    var configBuilder = new ConfigurationBuilder();

    var builder = WebApplication.CreateBuilder(args);

    var environment = builder.Configuration.GetSection("AppConfiguration").GetValue<string>("Environment");

    configBuilder.AddJsonFile("appsettings.json",
    optional: true,
    reloadOnChange: true)
    .AddJsonFile($"appsettings.{environment}.json",
    optional: true,
    reloadOnChange: true)
    .AddEnvironmentVariables();

    var config = configBuilder.Build();
    builder.Configuration.AddConfiguration(config);

    Log.Logger = new LoggerConfiguration()
        .ReadFrom.Configuration(config)
        .Enrich.FromLogContext()
        .Enrich.WithProperty("Environment", environment)
        .CreateLogger();

    var _sqlConnectionString = builder.Configuration.GetSection("Database").GetValue<string>("ConnectionString");

    if (string.IsNullOrEmpty(_sqlConnectionString))
    {
        DbContextOptionsBuilder<BmtDbContext> contextBuilder = new();
        _sqlConnectionString = new SqliteConnectionStringBuilder { DataSource = "file::memory:", Cache = SqliteCacheMode.Shared }.ToString();

        // In-memory sqlite requires an open connection throughout the whole lifetime of the database
        _connectionToInMemorySqlite = new SqliteConnection(_sqlConnectionString);
        _connectionToInMemorySqlite.Open();
        contextBuilder.UseSqlite(_connectionToInMemorySqlite);

        using BmtDbContext context = new(contextBuilder.Options);
        context.Database.EnsureCreated();
        InitContent.PopulateDb(context);

    }

    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                 .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));

    builder.Services.AddAuthorization(options =>
    {
        options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
    });
    builder.Services.AddCors(options =>
    {
        options.AddPolicy(_accessControlPolicyName,
        builder =>
        {
            builder.AllowAnyHeader();
            builder.AllowAnyMethod();
            builder.WithOrigins(
                (Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:3000"),
                "https://*.equinor.com",
                "https://pro-s-portal-ci.azurewebsites.net",
                "https://pro-s-portal-fqa.azurewebsites.net",
                "https://pro-s-portal-fprd.azurewebsites.net",
                "https://pro-s-portal-fprd.azurewebsites.net",
                "https://fusion-s-portal-ci.azurewebsites.net",
                "https://fusion-s-portal-fqa.azurewebsites.net",
                "https://fusion-s-portal-fprd.azurewebsites.net",
                "https://pr-3422.fusion-dev.net",
                "https://pr-*.fusion-dev.net"
            ).SetIsOriginAllowedToAllowWildcardSubdomains();
        });
    });

    var applicationInsightConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];

    var appInsightTelemetryOptions = new ApplicationInsightsServiceOptions
    {
        ConnectionString = config["ApplicationInsightConnectionString"],
    };

    if (_connectionToInMemorySqlite == null)
    {
        // Setting splitting behavior explicitly to avoid warning
        builder.Services.AddDbContext<BmtDbContext>(
                    options => options.UseSqlServer(_sqlConnectionString, o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SingleQuery))
                );
    }
    else
    {
        // Setting splitting behavior explicitly to avoid warning
        builder.Services.AddDbContext<BmtDbContext>(
            options => options.UseSqlite(_sqlConnectionString, o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SingleQuery))
        );
    }

    builder.Services.AddErrorFilter<ErrorFilter>();

    builder.Services.AddScoped<GraphQuery>();
    builder.Services.AddScoped<Mutation>();
    builder.Services.AddScoped<ProjectService>();
    builder.Services.AddScoped<ParticipantService>();
    builder.Services.AddScoped<EvaluationService>();
    builder.Services.AddScoped<QuestionService>();
    builder.Services.AddScoped<AnswerService>();
    builder.Services.AddScoped<ActionService>();
    builder.Services.AddScoped<NoteService>();
    builder.Services.AddScoped<ClosingRemarkService>();
    builder.Services.AddScoped<QuestionTemplateService>();
    builder.Services.AddScoped<ProjectCategoryService>();
    builder.Services.AddScoped<BMTScoreService>();
    builder.Services.AddScoped<IAuthService, AuthService>();

    builder.Services.AddGraphQLServer()
                    .AddProjections()
                    .AddAuthorization()
                    .AddFiltering()
                    .AddQueryType<GraphQuery>()
                    .AddMutationType<Mutation>();

    builder.Services.AddControllers();

    builder.Services.AddApplicationInsightsTelemetry(appInsightTelemetryOptions);

    builder.Services.AddHealthChecks().AddCheck<EvaluationService>("ModelsFromDB");

    builder.Services.AddSwaggerGen(c =>
    {
        c.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.OAuth2,
            Flows = new OpenApiOAuthFlows
            {
                Implicit = new OpenApiOAuthFlow
                {
                    TokenUrl = new Uri($"{builder.Configuration["AzureAd:Instance"]}/{builder.Configuration["AzureAd:TenantId"]}/oauth2/token"),
                    AuthorizationUrl = new Uri($"{builder.Configuration["AzureAd:Instance"]}/{builder.Configuration["AzureAd:TenantId"]}/oauth2/authorize"),
                    Scopes = { { $"api://{builder.Configuration["AzureAd:ClientId"]}/user_impersonation", "User Impersonation" } }
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
    builder.Host.UseSerilog();
    var app = builder.Build();

    app.Logger.LogInformation("Starting application...");

    if (_connectionToInMemorySqlite == null)
    {
        app.Logger.LogInformation("Using SQL database");
    }
    else
    {
        app.Logger.LogInformation("Using Sqlite in memory database");
    }

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

    app.UseCors(_accessControlPolicyName);

    app.UseAuthentication();
    app.UseMiddleware<RequestLoggingMiddleware>();
    app.UseAuthorization();

    app.UseEndpoints(endpoints =>
    {
        endpoints.MapHealthChecks("/health").AllowAnonymous();
        endpoints.MapGraphQL();
        endpoints.MapControllers();
    });

    app.Run();

}
catch (Exception ex)
{
    Console.WriteLine(string.Format("Exception was thrown starting the application {0}", ex.Message));
}
