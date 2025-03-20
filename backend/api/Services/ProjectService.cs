using api.Context;
using api.Models;

namespace api.Services;

public class ProjectService(BmtDbContext context)
{
    public Project Create(string externalID, string fusionProjectID)
    {
        var createDate = DateTimeOffset.UtcNow;

        var newProject = new Project
        {
            ExternalId = externalID,
            FusionProjectId = fusionProjectID,
            CreateDate = createDate
        };

        context.Projects.Add(newProject);

        context.SaveChanges();

        return newProject;
    }

    public IQueryable<Project> GetAll()
    {
        return context.Projects;
    }

    public Project GetProjectFromExternalId(string externalId)
    {
        var project = context.Projects
                             .FirstOrDefault(project => project.ExternalId.Equals(externalId));

        if (project == null)
        {
            throw new NotFoundInDBException($"Project with externalId: {externalId} not found");
        }

        return project;
    }

    public Project GetProjectFromFusionId(string fusionProjectId)
    {
        var project = context.Projects
                             .FirstOrDefault(project => project.FusionProjectId.Equals(fusionProjectId));

        if (project == null)
        {
            throw new NotFoundInDBException($"Project with fusionProjectId: {fusionProjectId} not found");
        }

        return project;
    }

    public Project GetProject(string projectId)
    {
        var project = context.Projects.FirstOrDefault(project => project.Id.Equals(projectId));

        if (project == null)
        {
            throw new NotFoundInDBException($"Project not found: {projectId}");
        }

        return project;
    }

    public Project SetIndicatorEvaluation(string projectId, Evaluation evaluation)
    {
        var project = GetProject(projectId);
        project.IndicatorEvaluationId = evaluation.Id;
        context.Projects.Update(project);
        context.SaveChanges();

        return project;
    }
}