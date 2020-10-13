using System.Linq;
using HotChocolate;
using HotChocolate.Types;
using api.Models;
using api.Context;

namespace api.GQL
{
    public class Query
    {
        /// <summary>
        /// Gets all projects.
        /// </summary>
        [UseSelection]
        public IQueryable<Project> GetProjects([Service] BmtDbContext context) =>
            context.Projects;
    }
}
