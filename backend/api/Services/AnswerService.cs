using System;
using System.Linq;

using HotChocolate;

using api.Context;
using api.Models;

namespace api.Services
{
    public class AnswerService
    {
        private readonly BmtDbContext _context;

        public AnswerService([Service] BmtDbContext context)
        {
            _context = context;
        }

        public Answer Create(
            Participant answeredBy,
            Progression progression,
            Question question,
            Severity severity,
            string text
        )
        {
            DateTime createDate = DateTime.UtcNow;

            Answer newAnswer = new Answer
            {
                CreateDate = createDate,
                AnsweredBy = answeredBy,
                Progression = progression,
                Question = question,
                Severity = severity,
                Text = text
            };

            _context.Answers.Add(newAnswer);

            _context.SaveChanges();
            return newAnswer;
        }

        public IQueryable<Answer> GetAll()
        {
            return _context.Answers;
        }

        public Answer GetAnswer(string AnswerId)
        {
            Answer Answer = _context.Answers.FirstOrDefault(Answer => Answer.Id.Equals(AnswerId));
            if (Answer == null)
            {
                throw new NotFoundInDBException($"Answer not found: {AnswerId}");
            }
            return Answer;
        }
    }
}
