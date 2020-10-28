using System;
using System.Collections.Generic;
using System.Linq;

using HotChocolate;

using api.Context;
using api.Models;

namespace api.Services
{
    public class EvaluationService
    {
        private readonly BmtDbContext _context;

        public EvaluationService([Service] BmtDbContext context)
        {
            _context = context;
        }

        public Evaluation Create(string name, Project project, Participant creator)
        {
            DateTime createDate = DateTime.UtcNow;

            Evaluation newEvaluation = new Evaluation
            {
                CreateDate = createDate,
                Name = name,
                Progression = Progression.Nomination,
                Project = project,
                Participants = new List<Participant>(new Participant[] { creator }),
            };

            _context.Evaluations.Add(newEvaluation);

            _context.SaveChanges();
            return newEvaluation;
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
                throw new Exception($"Evaluation not found: {evaluationId}");
            }
            return evaluation;
        }
    }
}
