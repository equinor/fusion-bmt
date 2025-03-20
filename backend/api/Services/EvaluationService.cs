using api.Context;
using api.Models;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace api.Services;

public class EvaluationService(BmtDbContext context) : IHealthCheck
{
    public Evaluation Create(string name,
                             Project project,
                             string previousEvaluationId)
    {
        var createDate = DateTimeOffset.UtcNow;

        var newEvaluation = new Evaluation
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

        context.Evaluations.Add(newEvaluation);

        context.SaveChanges();

        return newEvaluation;
    }

    public Evaluation ProgressEvaluation(Evaluation evaluation, Progression nextProgression)
    {
        evaluation.Progression = nextProgression;
        context.Evaluations.Update(evaluation);
        context.SaveChanges();

        return evaluation;
    }

    public Evaluation SetSummary(Evaluation evaluation, string summary)
    {
        evaluation.Summary = summary;
        context.Evaluations.Update(evaluation);
        context.SaveChanges();

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
        context.Evaluations.Update(evaluation);
        context.SaveChanges();

        return evaluation;
    }

    public Evaluation SetEvaluationToAnotherProject(Evaluation evaluation, Project newProject)
    {
        evaluation.Project = newProject;
        context.Evaluations.Update(evaluation);
        context.SaveChanges();

        return evaluation;
    }

    public IQueryable<Evaluation> GetAll()
    {
        return context.Evaluations;
    }

    public Evaluation GetEvaluation(string evaluationId)
    {
        var evaluation = context.Evaluations.FirstOrDefault(evaluation => evaluation.Id.Equals(evaluationId));

        if (evaluation == null)
        {
            throw new NotFoundInDBException($"Evaluation not found: {evaluationId}");
        }

        return evaluation;
    }

    public Evaluation SetStatus(Evaluation evaluation, Status newStatus)
    {
        evaluation.Status = newStatus;
        context.Evaluations.Update(evaluation);
        context.SaveChanges();

        return evaluation;
    }

    public Evaluation SetIndicatorActivity(Evaluation evaluation)
    {
        evaluation.IndicatorActivityDate = DateTime.UtcNow;
        context.Evaluations.Update(evaluation);
        context.SaveChanges();

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