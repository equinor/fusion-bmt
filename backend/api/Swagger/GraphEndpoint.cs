using api.Models;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace api.Swagger
{
    public class GraphEndpoint : IDocumentFilter
    {
        public static readonly string graphEndpoint = @"/graphql";

        public static readonly string query = "{\"query\":\n\"" +
        "query {projects {id, fusionProjectId, createDate}}\"}";

        public void Apply(OpenApiDocument openApiDocument, DocumentFilterContext context)
        {
            var pathItem = new OpenApiPathItem();

            var operation = new OpenApiOperation();
            operation.Tags.Add(new OpenApiTag { Name = "GraphQL" });
            operation.RequestBody = new OpenApiRequestBody()
            {
                Content = new Dictionary<string, OpenApiMediaType> {
                    {"application/json",
                    new OpenApiMediaType()
                    {
                        Schema = context.SchemaGenerator
                        .GenerateSchema(typeof(Project), context.SchemaRepository),
                        Example = new OpenApiString(query)
                    }
                    }
                }
            };

            pathItem.AddOperation(OperationType.Post, operation);
            openApiDocument?.Paths.Add(graphEndpoint, pathItem);
        }
    }

}
