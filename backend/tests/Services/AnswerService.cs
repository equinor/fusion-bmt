using System;
using System.Linq;

using Xunit;

using api.Context;
using api.Models;
using api.Services;

namespace tests
{
    [Collection("UsesDbContext")]
    public class AnswerServiceTest
    {
        private readonly BmtDbContext _context;
        public AnswerServiceTest()
        {
            _context = Globals.context;
        }

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
            AnswerService answerService = new AnswerService(_context);

            int nAnswerBefore = answerService.GetAll().Count();
            answerService.Create(ExampleParticipant(), ExampleQuestion(), Severity.High, "test_answer");
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

            Answer answerCreate = answerService.Create(ExampleParticipant(), ExampleQuestion(), Severity.High, "test_answer");

            Answer answerGet = answerService.GetAnswer(answerCreate.Id);

            Assert.Equal(answerCreate, answerGet);
        }

        [Fact]
        public void GetFromQuestionExists()
        {
            AnswerService answerService = new AnswerService(_context);
            QuestionService questionService = new QuestionService(_context);
            Evaluation evaluation = ExampleEvaluation();
            Question question = questionService.Create(ExampleQuestionTemplate(), evaluation);
            Participant participant = ExampleParticipant();
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
            AnswerService answerService = new AnswerService(_context);
            ParticipantService participantService = new ParticipantService(_context);
            Question question = ExampleQuestion();
            Participant participant = participantService.Create("GetFromQuestionNotExists_id", ExampleEvaluation(), Organization.All, Role.ReadOnly);

            Assert.Throws<NotFoundInDBException>(() => answerService.GetAnswer(question, participant, Progression.Nomination));
        }

        [Fact]
        public void UpdateAnswer()
        {
            AnswerService answerService = new AnswerService(_context);
            Question question = ExampleQuestion();
            Participant participant = ExampleParticipant();
            string initialText = "test answer";
            Answer answer = answerService.Create(participant, question, Severity.High, initialText);
            string answerId = answer.Id;

            string newText = "some different test answer";
            answerService.UpdateAnswer(answer, Severity.High, newText);

            Answer resultingAnswer = answerService.GetAnswer(answerId);
            Assert.Equal(newText, resultingAnswer.Text);
        }

        private Question ExampleQuestion()
        {
            QuestionService questionService = new QuestionService(_context);
            return questionService.GetAll().First();
        }

        private Evaluation ExampleEvaluation()
        {
            EvaluationService evaluationService = new EvaluationService(_context);
            return evaluationService.GetAll().First();
        }

        private Participant ExampleParticipant()
        {
            ParticipantService participantService = new ParticipantService(_context);
            return participantService.GetAll().First();
        }

        private QuestionTemplate ExampleQuestionTemplate()
        {
            QuestionTemplateService questionTemplateService = new QuestionTemplateService(_context);
            return questionTemplateService.GetAll().First();
        }
    }
}
