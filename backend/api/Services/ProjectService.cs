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
        public Project Create(string externalID, string fusionProjectID)
        {
            DateTimeOffset createDate = DateTimeOffset.UtcNow;

            Project newProject = new Project
            {
                ExternalId = externalID,
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

        public Project GetProjectFromExternalId(string externalId)
        {
            Project project = _context.Projects
                .FirstOrDefault(project => project.ExternalId.Equals(externalId));
            if (project == null)
            {
                throw new NotFoundInDBException($"Project with externalId: {externalId} not found");
            }
            return project;
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

        public Project SetIndicatorEvaluation(string projectId, Evaluation evaluation)
        {
            Project project = GetProject(projectId);
            project.IndicatorEvaluationId = evaluation.Id;
            _context.Projects.Update(project);
            _context.SaveChanges();
            return project;
        }
    }
}
