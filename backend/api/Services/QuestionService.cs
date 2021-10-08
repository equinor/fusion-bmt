using System;
using System.Collections.Generic;
using System.Linq;

using api.Context;
using api.Models;

namespace api.Services
{
    public class QuestionService
    {
        private readonly BmtDbContext _context;

        public QuestionService(BmtDbContext context)
        {
            _context = context;
        }

        public Question Create(
            QuestionTemplate template,
            Evaluation evaluation
        )
        {

            Question newQuestion = CreateInternal(template, evaluation);
            _context.Questions.Add(newQuestion);

            _context.SaveChanges();
            return newQuestion;
        }

        private static Question CreateInternal(
            QuestionTemplate template,
            Evaluation evaluation
        )
        {
            DateTimeOffset createDate = DateTimeOffset.UtcNow;

            return new Question
            {
                CreateDate = createDate,
                Barrier = template.Barrier,
                Evaluation = evaluation,
                Organization = template.Organization,
                Text = template.Text,
                Order = template.Order,
                SupportNotes = template.SupportNotes,
                QuestionTemplate = template,
            };
        }

        public List<Question> CreateBulk(
            List<QuestionTemplate> templates,
            Evaluation evaluation
        )
        {
            List<Question> questions = new List<Question>();
            foreach (QuestionTemplate template in templates)
            {
                questions.Add(CreateInternal(template, evaluation));
            }
            _context.Questions.AddRange(questions);
            _context.SaveChanges();
            return questions;
        }

        public ICollection<Question> SquashOrder(ICollection<Question> questions)
        {
            var orderedQuestions = questions.OrderBy(q => q.Order);
            int order = 1;
            foreach (var q in orderedQuestions)
            {
                q.Order = order++;
                _context.Questions.Update(q);
            }

            _context.SaveChanges();
            return questions;
        }

        public IQueryable<Question> GetAll()
        {
            return _context.Questions;
        }

        public IQueryable<Question> GetQuestion(string questionId)
        {
            IQueryable<Question> queryableQuestion = _context.Questions.Where(question => question.Id.Equals(questionId));
            Question question = queryableQuestion.FirstOrDefault();
            if (question == null)
            {
                throw new NotFoundInDBException($"Question not found: {questionId}");
            }
            return queryableQuestion;
        }
    }
}
