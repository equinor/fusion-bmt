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
        private readonly SqliteConnection _connection;
        private readonly string _sqlConnectionString;

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;

            // In-memory sqlite requires an open connection throughout the whole lifetime of the database
            _sqlConnectionString = Configuration.GetSection("Database").GetValue<string>("ConnectionString");
            if (string.IsNullOrEmpty(_sqlConnectionString))
            {
                DbContextOptionsBuilder<BmtDbContext> builder = new DbContextOptionsBuilder<BmtDbContext>();
                string connectionString = new SqliteConnectionStringBuilder { DataSource = "file::memory:", Cache = SqliteCacheMode.Shared }.ToString();
                _connection = new SqliteConnection(connectionString);
                _connection.Open();
                builder.UseSqlite(_connection);

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
                        "http://localhost:" + (Environment.GetEnvironmentVariable("FRONTEND_PORT") ?? "3000"),
                        "https://*.equinor.com",
                        "https://pro-s-portal-ci.azurewebsites.net",
                        "https://pro-s-portal-fqa.azurewebsites.net",
                        "https://pro-s-portal-fprd.azurewebsites.net"
                    ).SetIsOriginAllowedToAllowWildcardSubdomains();
                });
            });

            if (!string.IsNullOrEmpty(_sqlConnectionString))
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
                    options => options.UseSqlite(_connection, o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SingleQuery))
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

            if (!string.IsNullOrEmpty(_sqlConnectionString))
            {
                logger.LogInformation("Using SQL database");
            }
            else
            {
                logger.LogInformation("Using Sqlite in memory database");
            }

            if (env.IsDevelopment())
            {
                logger.LogInformation("Configuring for development environment");
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

            app.UseAuthorization();

            /* Run locally without Authorization
             *
             * When developing locally it can useful to disable authorization
             * of the exposed endpoints. This can be done by temporarily
             * removing 'RequireAuthorization()` for MapGraphQL and
             * MapControllers.
             */
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapHealthChecks("/health").AllowAnonymous();
                endpoints.MapGraphQL().RequireAuthorization();
                endpoints.MapControllers().RequireAuthorization();
            });
        }
    }
}
