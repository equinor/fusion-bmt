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
        /* Services */
        protected readonly Mutation _mutation;
        protected readonly ProjectService _projectService;
        protected readonly EvaluationService _evaluationService;
        protected readonly ParticipantService _participantService;
        protected readonly QuestionService _questionService;
        protected readonly AnswerService _answerService;
        protected readonly QuestionTemplateService _questionTemplateService;
        protected readonly ActionService _actionService;
        protected readonly NoteService _noteService;
        protected readonly ClosingRemarkService _closingRemarkService;
        protected readonly MockAuthService _authService;

        /* Helpers */
        private readonly Project _project;

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
            _closingRemarkService = new ClosingRemarkService(_context);
            _authService = new MockAuthService();
            _mutation = new Mutation(
                _projectService,
                _evaluationService,
                _participantService,
                _questionService,
                _answerService,
                _questionTemplateService,
                _actionService,
                _noteService,
                _closingRemarkService,
                _authService,
                new Logger<Mutation>(factory)
            );

            _project = _projectService.Create("Project");
        }
    }
}
