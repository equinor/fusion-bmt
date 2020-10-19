using System;
using System.Linq;
using System.Threading.Tasks;

using HotChocolate;

using api.Context;
using api.Models;

namespace api.Services
{
    public class ProjectService
    {
        private BmtDbContext _context;

        public ProjectService([Service] BmtDbContext context)
        {
            _context = context;
        }

        public async Task<Project> Create(string fusionProjectID)
        {
            DateTime createDate = DateTime.UtcNow;

            Project newProject = new Project{
                FusionProjectId = fusionProjectID,
                CreateDate = createDate
            };

            await _context.Projects.AddAsync(newProject);

            await _context.SaveChangesAsync();
            return newProject;
        }

        public IQueryable<Project> GetAll()
        {
            return _context.Projects;
        }
    }
}
