using System;
using System.Linq;

using api.Context;
using api.Models;

namespace api.Services
{
    public class EvaluationService
    {
        private readonly BmtDbContext _context;

        public EvaluationService(BmtDbContext context)
        {
            _context = context;
        }

        public Evaluation Create(string name, Project project)
        {
            DateTime createDate = DateTime.UtcNow;

            Evaluation newEvaluation = new Evaluation
            {
                CreateDate = createDate,
                Name = name,
                Progression = Progression.Nomination,
                Project = project
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
    }
}
