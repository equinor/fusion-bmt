using api.Context;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class BmtScoreService(BmtDbContext context)
{
    public async Task<List<BMTScore>> GenerateBmtScores()
    {
        var projectsWithIndicator = await context
                                          .Projects
                                          .Where(p => p.IndicatorEvaluationId != null)
                                          .ToListAsync();

        var bmtScores = new List<BMTScore>();

        foreach (var project in projectsWithIndicator)
        {
            var score = await GenerateBmtScore(project.IndicatorEvaluationId, project.Id);
            bmtScores.Add(score);
        }

        return bmtScores;
    }

    public async Task<BMTScore> GenerateBmtScore(string projectId)
    {
        var project = await context.Projects.FindAsync(projectId)
                      ?? throw new ArgumentException("ProjectId does not exist.");

        if (string.IsNullOrEmpty(project.IndicatorEvaluationId))
        {
            throw new ArgumentException("Project does not have an IndicatorEvaluationId.");
        }

        return await GenerateBmtScore(project.IndicatorEvaluationId, projectId);
    }

    public async Task<BMTScore> GenerateBmtScore(string evaluationId, string projectId)
    {
        if (string.IsNullOrEmpty(evaluationId) || string.IsNullOrEmpty(projectId))
        {
            throw new ArgumentException("EvaluationId and ProjectId cannot be null or empty.");
        }

        var (WorkshopScore, FollowUpScore) = await CalculateScores(evaluationId);

        return new BMTScore
        {
            ProjectId = projectId,
            EvaluationId = evaluationId,
            WorkshopScore = WorkshopScore,
            FollowUpScore = FollowUpScore,
        };
    }

    private async Task<(double WorkshopScore, double FollowUpScore)> CalculateScores(string evaluationId)
    {
        var answers = await context.Answers
                                   .Include(a => a.Question)
                                   .Where(a => a.Question.EvaluationId == evaluationId && a.Severity != Severity.NA)
                                   .ToListAsync();

        var workshopAnswers = answers.Where(a => a.Progression == Progression.Workshop);
        var followUpAnswers = answers.Where(a => a.Progression == Progression.FollowUp);

        var workshopScore = CalculateScore(workshopAnswers);
        var followUpScore = CalculateScore(followUpAnswers);

        return (workshopScore, followUpScore);
    }

    private static double CalculateScore(IEnumerable<Answer> answers)
    {
        var totalAnswers = answers.Count();

        if (totalAnswers == 0)
        {
            return 0;
        }

        var onTrackAnswers = answers.Count(a => a.Severity == Severity.OnTrack);

        return (double)onTrackAnswers / totalAnswers;
    }
}
