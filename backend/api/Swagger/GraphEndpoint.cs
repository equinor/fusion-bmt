using System.Collections.Generic;
using Microsoft.OpenApi.Models;
using Microsoft.OpenApi.Any;
using Swashbuckle.AspNetCore.SwaggerGen;

using api.Models;

namespace api.Swagger
{    public class GraphEndpoint : IDocumentFilter
    {
        public const string graphEndpoint = @"/graphql";

        public const string query = "{\"query\":\"" +
        "query GetProject{projects {projectId, fusionProjectId, createDate, " +
        "evaluations {actions {title}, createDate, evaluationId, participants " +
        "{discipline}, progression, projectId, questions {text}}}}\"}";

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
