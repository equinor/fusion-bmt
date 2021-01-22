using System;
using System.Linq;

using api.Context;
using api.Models;

using System.Threading;
using System.Threading.Tasks;
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

        public Evaluation Create(string name, Project project)
        {
            DateTimeOffset createDate = DateTimeOffset.UtcNow;

            Evaluation newEvaluation = new Evaluation
            {
                CreateDate = createDate,
                Name = name,
                Progression = Progression.Nomination,
                Project = project,
                Status = Status.Active
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
