using System;
using System.Collections.Generic;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Identity.Web;
using Microsoft.OpenApi.Models;

using HotChocolate;

using api.Context;
using api.Services;
using api.GQL;
using api.Swagger;
using api.Authorization;


namespace api
{
    public class Startup
    {
        private readonly string _accessControlPolicyName = "AllowSpecificOrigins";
        private readonly SqliteConnection _connectionToInMemorySqlite;
        private readonly string _sqlConnectionString;

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;

            _sqlConnectionString = Configuration.GetSection("Database").GetValue<string>("ConnectionString");
            if (string.IsNullOrEmpty(_sqlConnectionString))
            {
                DbContextOptionsBuilder<BmtDbContext> builder = new DbContextOptionsBuilder<BmtDbContext>();
                _sqlConnectionString = new SqliteConnectionStringBuilder { DataSource = "file::memory:", Cache = SqliteCacheMode.Shared }.ToString();

                // In-memory sqlite requires an open connection throughout the whole lifetime of the database
                _connectionToInMemorySqlite = new SqliteConnection(_sqlConnectionString);
                _connectionToInMemorySqlite.Open();
                builder.UseSqlite(_connectionToInMemorySqlite);

                using (BmtDbContext context = new BmtDbContext(builder.Options))
                {
                    context.Database.EnsureCreated();
                    InitContent.PopulateDb(context);
                }
            }
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddMicrosoftIdentityWebApi(Configuration.GetSection("AzureAd"));

            services.AddAuthorization(options =>
            {
                options.FallbackPolicy = new AuthorizationPolicyBuilder()
                    .RequireAuthenticatedUser()
                    .Build();
            });
            services.AddCors(options =>
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
                        "https://pro-s-portal-fprd.azurewebsites.net"
                    ).SetIsOriginAllowedToAllowWildcardSubdomains();
                });
            });

            if (_connectionToInMemorySqlite == null)
            {
                // Setting splitting behavior explicitly to avoid warning
                services.AddDbContext<BmtDbContext>(
                    options => options.UseSqlServer(_sqlConnectionString, o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SingleQuery))
                );
            }
            else
            {
                // Setting splitting behavior explicitly to avoid warning
                services.AddDbContext<BmtDbContext>(
                    options => options.UseSqlite(_sqlConnectionString, o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SingleQuery))
                );
            }

            services.AddErrorFilter<ErrorFilter>();

            services.AddScoped<GraphQuery>();
            services.AddScoped<Mutation>();
            services.AddScoped<ProjectService>();
            services.AddScoped<ParticipantService>();
            services.AddScoped<EvaluationService>();
            services.AddScoped<QuestionService>();
            services.AddScoped<AnswerService>();
            services.AddScoped<QuestionTemplateService>();
            services.AddScoped<ActionService>();
            services.AddScoped<NoteService>();
            services.AddScoped<IAuthService, AuthService>();

            services.AddGraphQLServer()
                .AddProjections()
                .AddAuthorization()
                .AddFiltering()
                .AddQueryType<GraphQuery>()
                .AddMutationType<Mutation>();

            services.AddControllers();

            services.AddApplicationInsightsTelemetry();
            services.AddHealthChecks().AddCheck<EvaluationService>("ModelsFromDB");

            services.AddSwaggerGen(c =>
            {
                c.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme

                {
                    Type = SecuritySchemeType.OAuth2,

                    Flows = new OpenApiOAuthFlows
                    {
                        Implicit = new OpenApiOAuthFlow
                        {
                            TokenUrl = new Uri($"{Configuration["AzureAd:Instance"]}/{Configuration["AzureAd:TenantId"]}/oauth2/token"),
                            AuthorizationUrl = new Uri($"{Configuration["AzureAd:Instance"]}/{Configuration["AzureAd:TenantId"]}/oauth2/authorize"),
                            Scopes = { { $"api://{Configuration["AzureAd:ClientId"]}/user_impersonation", "User Impersonation" } }
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

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILogger<Startup> logger)
        {
            app.UseRouting();
            app.UseAuthentication();
            app.UseCors(_accessControlPolicyName);

            if (_connectionToInMemorySqlite == null)
            {
                logger.LogInformation("Using SQL database");
            }
            else
            {
                logger.LogInformation("Using Sqlite in memory database");
            }

            if (env.IsDevelopment() || env.EnvironmentName == "Test")
            {
                logger.LogInformation($"Configuring for {env.EnvironmentName} environment");
                app.UseDeveloperExceptionPage();

                var option = new RewriteOptions();
                app.UseRewriter(option);
            }
            else
            {
                logger.LogInformation("Configuring for production environment");
            }

            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "api v1");
                c.OAuthAppName("Fusion-BMT");
                c.OAuthClientId(Configuration["AzureAd:ClientId"]);
                c.OAuthAdditionalQueryStringParams(new Dictionary<string, string>
                    { { "resource", $"{Configuration["AzureAd:ClientId"]}" } });
            });

            if (env.IsDevelopment())
            {
                /* Disable endpoints authorization for development environment
                 *
                 * With authorization enabled we can't easily access graphql
                 * endpoints or run schema command, so we can disable it by
                 * default for Development environment.
                 *
                 * For Production and Test environments authorization has to
                 * stay.
                */
                app.UseEndpoints(endpoints =>
                {
                    endpoints.MapHealthChecks("/health").AllowAnonymous();
                    endpoints.MapGraphQL();
                    endpoints.MapControllers();
                });
                app.UseAuthorization();
            }
            else
            {
                app.UseAuthorization();
                app.UseEndpoints(endpoints =>
                {
                    endpoints.MapHealthChecks("/health").AllowAnonymous();
                    endpoints.MapGraphQL().RequireAuthorization();
                    endpoints.MapControllers().RequireAuthorization();
                });
            }
        }
    }
}
