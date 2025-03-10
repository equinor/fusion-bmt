using api.Context;
using api.Models;

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

        public ProjectCategory Delete(ProjectCategory projectCategory)
        {
            _context.ProjectCategories.Remove(projectCategory);
            _context.SaveChanges();
            return projectCategory;
        }

        public ProjectCategory CopyFrom(string newName, ProjectCategory other)
        {
            var newProjectCategory = _Create(newName);
            var activeTemplates = other.QuestionTemplates.Where(qt => qt.Status == Status.Active);

            foreach (var template in activeTemplates)
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
