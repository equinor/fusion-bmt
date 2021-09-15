using System;
using System.Linq;
using System.Collections.Generic;

using api.Context;
using api.Models;

using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;

namespace api.Services
{
    public class ProjectCategoryService
    {
        private readonly BmtDbContext _context;

        private ProjectCategory _Create(string name)
        {
            var newProjectCategory = new ProjectCategory
            {
                Name = name,
                QuestionTemplates = new List<QuestionTemplate>()
            };

            return newProjectCategory;
        }

        public ProjectCategoryService(BmtDbContext context)
        {
            _context = context;
        }

        public ProjectCategory Create(string name)
        {
            var newProjectCategory = _Create(name);
            _context.ProjectCategories.Add(newProjectCategory);
            _context.SaveChanges();
            return newProjectCategory;
        }

        public ProjectCategory CopyFrom(string newName, ProjectCategory other)
        {
            var newProjectCategory = _Create(newName);

            foreach(var template in other.QuestionTemplates)
            {
                newProjectCategory.QuestionTemplates.Add(template);
            }

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
