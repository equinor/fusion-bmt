using System;
using System.Linq;

using api.Context;
using api.Models;

using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;

namespace api.Services
{
    public class IndicatorService
    {
        private readonly BmtDbContext _context;

        public IndicatorService(BmtDbContext context)
        {
            _context = context;
        }

        public async Task<double> GenerateBMTScore(string evaluationId)
        {
            Evaluation evaluation = await _context.Evaluations
                .Include(e => e.Questions)
                .ThenInclude(q => q.Answers)
                .FirstOrDefaultAsync(e => e.Id == evaluationId) ?? throw new ArgumentException("Evaluation not found");

            var answers = evaluation.Questions.SelectMany(q => q.Answers).Where(a => a.Progression == Progression.FollowUp);

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
