using System.Collections.Generic;
using System;

using Microsoft.OpenApi.Models;
using Microsoft.OpenApi.Any;

using Swashbuckle.AspNetCore.SwaggerGen;

using api.Models;

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
