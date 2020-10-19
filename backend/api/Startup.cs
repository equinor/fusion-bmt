using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using HotChocolate;
using HotChocolate.AspNetCore;

using api.Context;
using api.Scripts;
using api.Services;
using api.GQL;

namespace api
{
    public class Startup
    {
        private readonly string _accessControlPolicyName = "AllowSpecificOrigins";

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddMicrosoftIdentityWebApi(Configuration.GetSection("AzureAd"));

            services.AddCors(options =>
            {
                options.AddPolicy(_accessControlPolicyName,
                builder =>
                {
                    builder.AllowAnyHeader();
                    builder.AllowAnyMethod();
                    builder.WithOrigins(
                        "http://localhost:3000",
                        "https://*.equinor.com"
                    ).SetIsOriginAllowedToAllowWildcardSubdomains();
                });
            });

            services.AddDbContext<BmtDbContext>();

            services.AddScoped<ProjectService>();

            services.AddGraphQL(s =>
                SchemaBuilder.New()
                    .AddServices(s)
                    .AddQueryType<Query>()
                    .AddMutationType<Mutation>()
                    .Create()
            );

            services.AddControllers();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "api", Version = "v1" });
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseCors(_accessControlPolicyName);

            Initialize.InitializeDatabase(app);

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "api v1"));

                app.UsePlayground("/graphql");
            }

            app.UseRouting();

            app.UseGraphQL("/graphql");

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
