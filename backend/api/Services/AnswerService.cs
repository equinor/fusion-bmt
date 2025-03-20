using api.Context;
using api.Models;
using Microsoft.EntityFrameworkCore;

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
            string text,
            Progression progression
        )
        {
            DateTimeOffset createDate = DateTimeOffset.UtcNow;

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

        public Answer GetAnswer(Question question, Participant participant, Progression progression, bool isAdmin = false)
        {
            if (question == null)
            {
                throw new ArgumentNullException(nameof(question));
            }

            if (participant == null && !isAdmin)
            {
                throw new ArgumentNullException(nameof(participant));
            }

            IQueryable<Answer> answers = _context
                                         .Answers
                                         .Where(Answer =>
                                                    Answer.Question.Equals(question)
                                                    && Answer.Progression.Equals(progression)
                                         );

            Answer answer;

            /* From workshop and onwards, facilitators no longer have individual
             * answers. Rather they edit the same answer.
             *
             * This type of logic is not transparent when implemented inside
             * this generic GetAnswer method. We should strongly consider adding
             * a seperate API endpoint for this to avoid confusion.
             */
            if ((isAdmin || participant.Role == Role.Facilitator) &&
                progression >= Progression.Workshop)
            {
                answer = answers
                    .FirstOrDefault(answer =>
                                        answer.AnsweredBy.Role.Equals(Role.Facilitator)
                    );
            }
            else
            {
                answer = answers
                    .FirstOrDefault(answer =>
                                        answer.AnsweredBy.Equals(participant)
                    );
            }

            if (answer == null)
            {
                throw new NotFoundInDBException($"Answer not found for question {question.Id} for participant {participant?.Id} and progression {progression}");
            }

            return answer;
        }

        public Answer UpdateAnswer(Answer answer,
                                   Severity severity,
                                   string text)
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

        public IQueryable<Answer> CreateFollowUpAnswers(Evaluation evaluation)
        {
            List<Answer> answers = _context.Answers.Include(
                a => a.Question
            ).Where(
                a => (a.Progression.Equals(Progression.Workshop)
                      && a.Question.Evaluation.Equals(evaluation))
            ).ToList();

            foreach (Answer a in answers)
            {
                Create(a.AnsweredBy, a.Question, a.Severity, a.Text, Progression.FollowUp);
            }

            return GetAll().Where(a => a.Progression.Equals(Progression.FollowUp));
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
