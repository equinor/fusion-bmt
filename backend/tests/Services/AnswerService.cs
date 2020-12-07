using System;
using System.Linq;

using Xunit;

using api.Models;
using api.Services;

namespace tests
{
    [Collection("UsesDbContext")]
    public class AnswerServiceTest : DbContextTestSetup
    {
        [Fact]
        public void GetQueryable()
        {
            AnswerService answerService = new AnswerService(_context);

            IQueryable<Answer> answerQueryable = answerService.GetAll();

            Assert.True(answerQueryable.Count() > 0);
        }

        [Fact]
        public void Create()
        {
            ParticipantService participantService = new ParticipantService(_context);
            Participant participant = participantService.GetAll().ToList()[0];
            QuestionService questionService = new QuestionService(_context);
            Question question = questionService.GetAll().First();

            AnswerService answerService = new AnswerService(_context);
            int nAnswerBefore = answerService.GetAll().Count();
            answerService.Create(participant, question, Severity.High, "test_answer");
            int nAnswersAfter = answerService.GetAll().Count();

            Assert.Equal(nAnswerBefore + 1, nAnswersAfter);
        }

        [Fact]
        public void GetDoesNotExist()
        {
            AnswerService answerService = new AnswerService(_context);

            Assert.Throws<NotFoundInDBException>(() => answerService.GetAnswer("some_answer_id_that_does_not_exist"));
        }

        [Fact]
        public void GetExists()
        {
            AnswerService answerService = new AnswerService(_context);
            ParticipantService participantService = new ParticipantService(_context);
            Participant participant = participantService.GetAll().ToList()[1];
            QuestionService questionService = new QuestionService(_context);
            Question question = questionService.GetAll().First();

            Answer answerCreate = answerService.Create(participant, question, Severity.High, "test_answer");

            Answer answerGet = answerService.GetAnswer(answerCreate.Id);

            Assert.Equal(answerCreate, answerGet);
        }

        [Fact]
        public void GetFromQuestionExists()
        {
            QuestionTemplateService questionTemplateService = new QuestionTemplateService(_context);
            QuestionTemplate questionTemplate = questionTemplateService.GetAll().First();

            EvaluationService evaluationService = new EvaluationService(_context);
            Evaluation evaluation = evaluationService.GetAll().First();

            ParticipantService participantService = new ParticipantService(_context);
            Participant participant = participantService.GetAll().ToList()[0];

            QuestionService questionService = new QuestionService(_context);
            Question question = questionService.Create(questionTemplate, evaluation);

            AnswerService answerService = new AnswerService(_context);
            Answer answerCreate = answerService.Create(participant, question, Severity.High, "test_answer");

            Answer answerGet = answerService.GetAnswer(question, participant, question.Evaluation.Progression);

            Assert.Equal(answerCreate, answerGet);
        }

        [Fact]
        public void GetFromQuestionNull()
        {
            AnswerService answerService = new AnswerService(_context);

            Assert.Throws<ArgumentNullException>(() => answerService.GetAnswer(null, null, Progression.Alignment));
        }

        [Fact]
        public void GetFromQuestionNotExists()
        {
            EvaluationService evaluationService = new EvaluationService(_context);
            Evaluation evaluation = evaluationService.GetAll().First();

            ParticipantService participantService = new ParticipantService(_context);
            Participant participant = participantService.Create("GetFromQuestionNotExists_id", evaluation, Organization.All, Role.ReadOnly);

            QuestionService questionService = new QuestionService(_context);
            Question question = questionService.GetAll().First();

            AnswerService answerService = new AnswerService(_context);

            Assert.Throws<NotFoundInDBException>(() => answerService.GetAnswer(question, participant, Progression.Nomination));
        }

        [Fact]
        public void UpdateAnswer()
        {
            ParticipantService participantService = new ParticipantService(_context);
            Participant participant = participantService.GetAll().ToList()[2];

            QuestionService questionService = new QuestionService(_context);
            Question question = questionService.GetAll().First();

            AnswerService answerService = new AnswerService(_context);
            string initialText = "test answer";
            Answer answer = answerService.Create(participant, question, Severity.High, initialText);
            string answerId = answer.Id;

            string newText = "some different test answer";
            answerService.UpdateAnswer(answer, Severity.High, newText);

            Answer resultingAnswer = answerService.GetAnswer(answerId);
            Assert.Equal(newText, resultingAnswer.Text);
        }
    }
}
