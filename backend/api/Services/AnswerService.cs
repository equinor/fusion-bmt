using System;
using System.Linq;

using api.Context;
using api.Models;

namespace api.Services
{
    public class AnswerService
    {
        private readonly BmtDbContext _context;

        public AnswerService(BmtDbContext context)
        {
            _context = context;
        }

        public Answer Create(
            Participant answeredBy,
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
                Progression = question.Evaluation.Progression,
                Question = question,
                Severity = severity,
                Text = text
            };

            _context.Answers.Add(newAnswer);

            _context.SaveChanges();
            return newAnswer;
        }

        public Answer GetAnswer(Question question, Participant participant, Progression progression)
        {
            if (question == null)
            {
                throw new ArgumentNullException(nameof(question));
            }
            if (participant == null)
            {
                throw new ArgumentNullException(nameof(participant));
            }

            Answer Answer = _context.Answers.FirstOrDefault(Answer =>
                Answer.Question.Equals(question)
                && Answer.AnsweredBy.Equals(participant)
                && Answer.Progression.Equals(progression)
            );

            if (Answer == null)
            {
                throw new NotFoundInDBException($"Answer not found for question {question.Id} for participant {participant.Id} and progression {progression}");
            }
            return Answer;
        }

        public Answer UpdateAnswer(Answer answer, Severity severity, string text)
        {
            if (answer == null)
            {
                throw new ArgumentNullException(nameof(answer));
            }

            answer.Severity = severity;
            answer.Text = text;

            _context.Answers.Update(answer);
            _context.SaveChanges();

            return answer;
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
