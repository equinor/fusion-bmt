using System.Linq;
using HotChocolate.Data;

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

        [UseProjection]
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
