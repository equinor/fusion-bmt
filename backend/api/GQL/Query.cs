using HotChocolate.Data;
using System.Linq;
using Microsoft.Extensions.Logging;

using api.Models;
using api.Services;

namespace api.GQL
{
    public class GraphQuery
    {
        private readonly ProjectService _projectService;
        private readonly EvaluationService _evaluationService;
        private readonly ParticipantService _participantService;
        private readonly QuestionService _questionService;
        private readonly QuestionTemplateService _questionTemplateService;
        private readonly AnswerService _answerService;
        private readonly ActionService _actionService;
        private readonly NoteService _noteService;
        private readonly ClosingRemarkService _closingRemarkService;
        private readonly ILogger _logger;

        public GraphQuery(
            ProjectService projectService,
            EvaluationService evaluationService,
            ParticipantService participantService,
            QuestionService questionService,
            QuestionTemplateService questionTemplateService,
            AnswerService answerService,
            ActionService actionService,
            NoteService noteService,
            ClosingRemarkService closingRemarkService,
            ILogger<GraphQuery> logger
        )
        {
            _projectService = projectService;
            _evaluationService = evaluationService;
            _participantService = participantService;
            _questionService = questionService;
            _questionTemplateService = questionTemplateService;
            _answerService = answerService;
            _actionService = actionService;
            _noteService = noteService;
            _closingRemarkService = closingRemarkService;
            _logger = logger;
        }

        [UseProjection]
        [UseFiltering]
        public IQueryable<Project> GetProjects()
        {
            return _projectService.GetAll();
        }

        public Project GetProject(string fusionProjectID)
        {
            Project project;
            try
            {
                project = _projectService.GetProjectFromFusionId(fusionProjectID);
            }
            catch (NotFoundInDBException)
            {
                project = _projectService.Create(fusionProjectID);
                _logger.LogInformation($"Created new project with fusionProjectId: {fusionProjectID}");
            }
            return project;
        }

        [UseProjection]
        [UseFiltering]
        public IQueryable<Evaluation> GetEvaluations()
        {
            return _evaluationService.GetAll();
        }

        [UseProjection]
        [UseFiltering]
        public IQueryable<Participant> GetParticipants()
        {
            return _participantService.GetAll();
        }

        [UseProjection]
        [UseFiltering]
        public IQueryable<Question> GetQuestions()
        {
            return _questionService.GetAll();
        }

        [UseProjection]
        [UseFiltering]
        public IQueryable<QuestionTemplate> GetQuestionTemplates()
        {
            return _questionTemplateService.GetAll();
        }

        [UseProjection]
        [UseFiltering]
        public IQueryable<Answer> GetAnswers()
        {
            return _answerService.GetAll();
        }

        [UseProjection]
        [UseFiltering]
        public IQueryable<Action> GetActions()
        {
            return _actionService.GetAll();
        }

        [UseProjection]
        [UseFiltering]
        public IQueryable<Note> GetNotes()
        {
            return _noteService.GetAll();
        }

        [UseProjection]
        [UseFiltering]
        public IQueryable<ClosingRemark> GetClosingRemarks()
        {
            return _closingRemarkService.GetAll();
        }
    }
}
