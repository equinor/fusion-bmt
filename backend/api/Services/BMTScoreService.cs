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
                var scores = await GenerateBMTScore(project.IndicatorEvaluationId);

                bmtScores.Add(new BMTScore
                {
                    ProjectId = project.Id,
                    EvaluationId = project.IndicatorEvaluationId,
                    WorkshopScore = scores.Item1,
                    FollowUpScore = scores.Item2,
                });
            }

            return bmtScores;
        }


        public async Task<(double, double)> GenerateBMTScore(string evaluationId)
        {
            Evaluation evaluation = await _context.Evaluations
                .Include(e => e.Questions)
                .ThenInclude(q => q.Answers)
                .FirstOrDefaultAsync(e => e.Id == evaluationId) ?? throw new ArgumentException("Evaluation not found");

            var answers = evaluation.Questions.SelectMany(q => q.Answers).Where(a => a.Progression == Progression.FollowUp);

            if (!answers.Any())
            {
                return (0, 0);
            }

            var workshopScore = CalculateScore(evaluation, Progression.Workshop);
            var followUpScore = CalculateScore(evaluation, Progression.FollowUp);

            return (workshopScore, followUpScore);
        }

        private static double CalculateScore(Evaluation evaluation, Progression progression)
        {
            var answers = evaluation.Questions.SelectMany(q => q.Answers).Where(a => a.Progression == progression);

            if (!answers.Any())
            {
                return 0;
            }

            var totalAnswers = answers.Count();
            var onTrackAnswers = answers.Count(a => a.Severity == Severity.OnTrack);

            return (double)onTrackAnswers / totalAnswers;
        }
    }
}
