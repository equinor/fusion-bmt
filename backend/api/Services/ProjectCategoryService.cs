using System;
using System.Linq;

using api.Context;
using api.Models;

using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace api.Services
{
    public class ProjectCategoryService
    {
        private readonly BmtDbContext _context;

        public ProjectCategoryService(BmtDbContext context)
        {
            _context = context;
        }

        public ProjectCategory Create(string name)
        {

            ProjectCategory newProjectCategory = new ProjectCategory
            {
                Name = name,
            };

            _context.ProjectCategories.Add(newProjectCategory);
            _context.SaveChanges();
            return newProjectCategory;
        }

        public ProjectCategory Get(string id)
        {
            ProjectCategory category = _context.ProjectCategories.FirstOrDefault(
                x => x.Id.Equals(id)
            );

            if (category == null)
            {
                string msg = $"ProjectCategory not found: {id}";
                throw new NotFoundInDBException(msg);
            }

            return category;
        }

        public IQueryable<ProjectCategory> GetAll()
        {
            return _context.ProjectCategories;
        }
    }
}
