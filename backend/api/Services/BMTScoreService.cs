using System;
using System.Linq;

using api.Context;
using api.Models;

using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace api.Services
{
    public class BMTScoreService
    {
        private readonly BmtDbContext _context;

        public BMTScoreService(BmtDbContext context)
        {
            _context = context;
        }
        public async Task<List<BMTScore>> GenerateBMTScores()
        {
            var projectsWithIndicator = await _context.Projects.Where(p => p.IndicatorEvaluationId != null).ToListAsync();

            var bmtScores = new List<BMTScore>();
            foreach (var project in projectsWithIndicator)
            {
                var score = await GenerateBMTScore(project.IndicatorEvaluationId, project.Id);
                bmtScores.Add(score);
            }

            return bmtScores;
        }

        public async Task<BMTScore> GenerateBMTScore(string evaluationId, string projectId)
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
            var answers = await _context.Answers
                .Include(a => a.Question)
                .Where(a => a.Question.EvaluationId == evaluationId)
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
}
