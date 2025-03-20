using api.Context;
using api.Models;

namespace api.Services;

public class ProjectCategoryService(BmtDbContext context)
{
    private ProjectCategory _Create(string name)
    {
        var newProjectCategory = new ProjectCategory
        {
            Name = name,
            QuestionTemplates = new List<QuestionTemplate>()
        };

        return newProjectCategory;
    }

    public ProjectCategory Create(string name)
    {
        var newProjectCategory = _Create(name);
        context.ProjectCategories.Add(newProjectCategory);
        context.SaveChanges();

        return newProjectCategory;
    }

    public ProjectCategory Delete(ProjectCategory projectCategory)
    {
        context.ProjectCategories.Remove(projectCategory);
        context.SaveChanges();

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

        context.ProjectCategories.Add(newProjectCategory);
        context.SaveChanges();

        return newProjectCategory;
    }

    public ProjectCategory Get(string id)
    {
        var category = context.ProjectCategories.FirstOrDefault(
            x => x.Id.Equals(id)
        );

        if (category == null)
        {
            var msg = $"ProjectCategory not found: {id}";

            throw new NotFoundInDBException(msg);
        }

        return category;
    }

    public IQueryable<ProjectCategory> GetAll()
    {
        return context.ProjectCategories;
    }
}