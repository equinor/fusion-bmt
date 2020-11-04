using System.Linq;

using HotChocolate.Types;

using api.Models;
using api.Services;

namespace api.GQL
{
    public class GraphQuery
    {
        private readonly ProjectService _projectService;

        public GraphQuery(ProjectService projectService)
        {
            _projectService = projectService;
        }

        [UseSelection]
        public IQueryable<Project> GetProjects()
        {
            return _projectService.GetAll();
        }

        public Project GetProject(string fusionProjectID)
        {
            return _projectService.EnsureCreated(fusionProjectID);
        }
    }
}
