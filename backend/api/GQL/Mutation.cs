using System;
using System.Threading.Tasks;

using api.Services;
using api.Models;

namespace api.GQL
{
    public class Mutation
    {
        private readonly ProjectService _projectService;

        public Mutation(ProjectService projectService)
        {
            _projectService = projectService;
        }
        public async Task<Project> CreateProject(string fusionProjectID)
        {
            return await _projectService.Create(fusionProjectID);
        }
    }
}
