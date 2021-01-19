using System;
using System.Linq;

using api.Context;
using api.Models;

namespace api.Services
{
    public class ProjectService
    {
        private readonly BmtDbContext _context;

        public ProjectService(BmtDbContext context)
        {
            _context = context;
        }
        public Project Create(string fusionProjectID)
        {
            DateTimeOffset createDate = DateTimeOffset.UtcNow;

            Project newProject = new Project
            {
                FusionProjectId = fusionProjectID,
                CreateDate = createDate
            };

            _context.Projects.Add(newProject);

            _context.SaveChanges();
            return newProject;
        }

        public IQueryable<Project> GetAll()
        {
            return _context.Projects;
        }

        public Project GetProjectFromFusionId(string fusionProjectId)
        {
            Project project = _context.Projects
                .FirstOrDefault(project => project.FusionProjectId.Equals(fusionProjectId));
            if (project == null)
            {
                throw new NotFoundInDBException($"Project with fusionProjectId: {fusionProjectId} not found");
            }
            return project;
        }
        public Project GetProject(string projectId)
        {
            Project project = _context.Projects.FirstOrDefault(project => project.Id.Equals(projectId));
            if (project == null)
            {
                throw new NotFoundInDBException($"Project not found: {projectId}");
            }
            return project;
        }
    }
}
