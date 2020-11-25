using System;
using System.Linq;

using HotChocolate;

using api.Context;
using api.Models;

namespace api.Services
{
    public class QuestionService
    {
        private readonly BmtDbContext _context;

        public QuestionService([Service] BmtDbContext context)
        {
            _context = context;
        }

        public Question Create(
            QuestionTemplate template,
            Evaluation evaluation
        )
        {
            DateTime createDate = DateTime.UtcNow;

            Question newQuestion = new Question
            {
                CreateDate = createDate,
                Barrier = template.Barrier,
                Evaluation = evaluation,
                Organization = template.Organization,
                Text = template.Text,
                SupportNotes = template.SupportNotes,
                QuestionTemplate = template,
            };

            _context.Questions.Add(newQuestion);

            _context.SaveChanges();
            return newQuestion;
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
