using System;
using SystemAction = System.Action;
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
        private BmtDbContext _context;
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
            Answer answer = answerService.Create(ExampleParticipant(), Progression.Alignment, ExampleQuestion(), Severity.High, "test_answer");
            int nanswersAfter = answerService.GetAll().Count();

            Assert.Equal(nAnswerBefore + 1, nanswersAfter);
        }

        [Fact]
        public void GetDoesNotExist()
        {
            AnswerService answerService = new AnswerService(_context);

            SystemAction act = () => answerService.GetAnswer("some_answer_id_that_does_not_exist");

            Assert.Throws<Exception>(act);
        }

        [Fact]
        public void GetExists()
        {
            AnswerService answerService = new AnswerService(_context);

            Answer answerCreate = answerService.Create(ExampleParticipant(), Progression.Alignment, ExampleQuestion(), Severity.High, "test_answer");

            Answer answerGet = answerService.GetAnswer(answerCreate.Id);

            Assert.Equal(answerCreate, answerGet);
        }

        private Question ExampleQuestion()
        {
            QuestionService questionService = new QuestionService(_context);
            return questionService.GetAll().First();
        }

        private Participant ExampleParticipant()
        {
            ParticipantService participantService = new ParticipantService(_context);
            return participantService.GetAll().First();
        }
    }
}
