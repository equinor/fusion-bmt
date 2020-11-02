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
            Barrier barrier,
            Evaluation evaluation,
            Organization organization,
            Status status,
            string text,
            string supportNotes
        )
        {
            DateTime createDate = DateTime.UtcNow;

            Question newQuestion = new Question
            {
                CreateDate = createDate,
                Barrier = barrier,
                Evaluation = evaluation,
                Organization = organization,
                Status = status,
                Text = text,
                SupportNotes = supportNotes
            };

            _context.Questions.Add(newQuestion);

            _context.SaveChanges();
            return newQuestion;
        }

        public IQueryable<Question> GetAll()
        {
            return _context.Questions;
        }

        public Question GetQuestion(string questionId)
        {
            Question question = _context.Questions.FirstOrDefault(question => question.Id.Equals(questionId));
            if (question == null)
            {
                throw new Exception($"Question not found: {questionId}");
            }
            return question;
        }
    }
}
