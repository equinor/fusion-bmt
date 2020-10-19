using System.Linq;

using HotChocolate.Types;

using api.Models;
using api.Services;

namespace api.GQL
{
    public class Query
    {
        private readonly ProjectService _projectService;

        public Query(ProjectService projectService)
        {
            _projectService = projectService;
        }

        [UseSelection]
        public IQueryable<Project> GetProjects()
        {
            return _projectService.GetAll();
        }
    }
}
