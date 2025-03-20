using api.Context;
using api.Models;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace api.Services
{
    public class EvaluationService : IHealthCheck
    {
        private readonly BmtDbContext _context;

        public EvaluationService(BmtDbContext context)
        {
            _context = context;
        }

        public Evaluation Create(string name,
                                 Project project,
                                 string previousEvaluationId)
        {
            DateTimeOffset createDate = DateTimeOffset.UtcNow;

            Evaluation newEvaluation = new Evaluation
            {
                CreateDate = createDate,
                Name = name,
                Progression = Progression.Nomination,
                Project = project,
                ProjectId = project.Id,
                Status = Status.Active,
                Summary = "",
                PreviousEvaluationId = previousEvaluationId
            };

            _context.Evaluations.Add(newEvaluation);

            _context.SaveChanges();

            return newEvaluation;
        }

        public Evaluation ProgressEvaluation(Evaluation evaluation, Progression nextProgression)
        {
            evaluation.Progression = nextProgression;
            _context.Evaluations.Update(evaluation);
            _context.SaveChanges();

            return evaluation;
        }

        public Evaluation SetSummary(Evaluation evaluation, string summary)
        {
            evaluation.Summary = summary;
            _context.Evaluations.Update(evaluation);
            _context.SaveChanges();

            return evaluation;
        }

        public Evaluation SetWorkshopCompleteDate(Evaluation evaluation)
        {
            if (evaluation.WorkshopCompleteDate != null)
            {
                throw new InvalidOperationException(
                    $"Completion date already set as: {evaluation.WorkshopCompleteDate}");
            }

            if (evaluation.Progression != Progression.FollowUp)
            {
                throw new InvalidOperationException(
                    $"WorkshopCompleteDate requires an evaluation on FollowUp; it is: {evaluation.Progression}");
            }

            evaluation.WorkshopCompleteDate = DateTimeOffset.UtcNow;
            _context.Evaluations.Update(evaluation);
            _context.SaveChanges();

            return evaluation;
        }

        public Evaluation SetEvaluationToAnotherProject(Evaluation evaluation, Project newProject)
        {
            evaluation.Project = newProject;
            _context.Evaluations.Update(evaluation);
            _context.SaveChanges();

            return evaluation;
        }

        public IQueryable<Evaluation> GetAll()
        {
            return _context.Evaluations;
        }

        public Evaluation GetEvaluation(string evaluationId)
        {
            Evaluation evaluation = _context.Evaluations.FirstOrDefault(evaluation => evaluation.Id.Equals(evaluationId));

            if (evaluation == null)
            {
                throw new NotFoundInDBException($"Evaluation not found: {evaluationId}");
            }

            return evaluation;
        }

        public Evaluation SetStatus(Evaluation evaluation, Status newStatus)
        {
            evaluation.Status = newStatus;
            _context.Evaluations.Update(evaluation);
            _context.SaveChanges();

            return evaluation;
        }

        public Evaluation SetIndicatorActivity(Evaluation evaluation)
        {
            evaluation.IndicatorActivityDate = DateTime.UtcNow;
            _context.Evaluations.Update(evaluation);
            _context.SaveChanges();

            return evaluation;
        }

        public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            try
            {
                GetAll().OrderBy(e => e.CreateDate).FirstOrDefault();

                return Task.FromResult(HealthCheckResult.Healthy("Query DB successful"));
            }
            catch (Exception ex)
            {
                return Task.FromResult(HealthCheckResult.Unhealthy("Failed to query DB", ex));
            }
        }
    }
}
