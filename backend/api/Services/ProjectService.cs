using System;
using System.Linq;

using HotChocolate;

using api.Context;
using api.Models;

namespace api.Services
{
    public class ProjectService
    {
        private readonly BmtDbContext _context;

        public ProjectService([Service] BmtDbContext context)
        {
            _context = context;
        }

        public Project EnsureCreated(string fusionProjectID)
        {
            Project project = _context.Projects
                .FirstOrDefault(project => project.FusionProjectId.Equals(fusionProjectID));
            if (project == null)
            {
                return Create(fusionProjectID);
            }
            return project;
        }

        public Project Create(string fusionProjectID)
        {
            DateTime createDate = DateTime.UtcNow;

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
