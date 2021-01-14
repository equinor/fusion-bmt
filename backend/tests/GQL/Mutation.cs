using api.GQL;
using api.Services;
using api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using System;
using System.Linq;
using System.Collections.Generic;
using Xunit;

namespace tests
{
    [Collection("UsesDbContext")]
    public class MutationTest : DbContextTestSetup
    {
        private readonly Mutation _mutation;
        private readonly ProjectService _projectService;
        private readonly EvaluationService _evaluationService;
        private readonly ParticipantService _participantService;
        private readonly QuestionService _questionService;
        private readonly AnswerService _answerService;
        private readonly QuestionTemplateService _questionTemplateService;
        private readonly ActionService _actionService;
        private readonly NoteService _noteService;
        public MutationTest()
        {
            ILoggerFactory factory = new NullLoggerFactory();
            _projectService = new ProjectService(_context);
            _evaluationService = new EvaluationService(_context);
            _participantService = new ParticipantService(_context);
            _questionService = new QuestionService(_context);
            _answerService = new AnswerService(_context);
            _questionTemplateService = new QuestionTemplateService(_context);
            _actionService = new ActionService(_context);
            _noteService = new NoteService(_context);
            _mutation = new Mutation(
                _projectService,
                _evaluationService,
                _participantService,
                _questionService,
                _answerService,
                _questionTemplateService,
                _actionService,
                _noteService,
                new MockAuthService(),
                new Logger<Mutation>(factory)
            );
        }

        [Fact]
        public void CreateEvaluation()
        {
            string projectId = _context.Projects.First().Id;
            int evaluationsBefore = _context.Evaluations.Count();
            _mutation.CreateEvaluation("CreateEvaluation", projectId);
            int evaluationsAfter = _context.Evaluations.Count();

            Assert.Equal(evaluationsBefore + 1, evaluationsAfter);
        }

        [Fact]
        public void ProgressEvaluationToFollowup()
        {
            Project project = _projectService.Create("ProgressEvaluationToFollowup");
            Evaluation evaluation = _evaluationService.Create("ProgressEvaluationToFollowup", project);
            Participant participant = _participantService.Create("ProgressEvaluationToFollowup", evaluation, Organization.All, Role.Facilitator);

            List<Question> questions = _questionService.CreateBulk(_questionTemplateService.GetAll().ToList(), evaluation);
            _answerService.Create(participant, questions[0], Severity.High, "test_answer_0", Progression.Workshop);
            _answerService.Create(participant, questions[1], Severity.High, "test_answer_1", Progression.Workshop);
            _answerService.Create(participant, questions[2], Severity.High, "test_answer_2", Progression.Workshop);

            int nAnswersWorkshop = _context.Answers.Where(
                a => (a.Progression.Equals(Progression.Workshop) && a.Question.Evaluation.Equals(evaluation))
            ).Count();

            // Forces null on db relations
            // To simulate behavior of normal API call
            _context.ChangeTracker.Clear();

            _mutation.ProgressEvaluation(evaluation.Id, Progression.FollowUp);

            int nAnswersFollowup = _context.Answers.Where(
                a => (a.Progression.Equals(Progression.FollowUp) && a.Question.Evaluation.Equals(evaluation))
            ).Count();

            Assert.Equal(nAnswersWorkshop, nAnswersFollowup);
        }
    }
}
