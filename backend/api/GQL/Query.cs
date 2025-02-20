using api.Models;
using api.Services;
using Action = api.Models.Action;

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
        private readonly ProjectCategoryService _projectCategoryService;
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
            ProjectCategoryService projectCategoryService,
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
            _projectCategoryService = projectCategoryService;
            _logger = logger;
        }

        [UseProjection]
        [UseFiltering]
        public IQueryable<Project> GetProjects()
        {
            return _projectService.GetAll();
        }

        public Project GetProject(string fusionProjectID, string externalID)
        {
            Project project;
            try
            {
                try
                {
                    project = _projectService.GetProjectFromExternalId(externalID);
                }
                catch (NotFoundInDBException)
                {
                    project = _projectService.GetProjectFromFusionId(fusionProjectID);
                }
            }
            catch (NotFoundInDBException)
            {
                project = _projectService.Create(externalID, fusionProjectID);
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

        [UseProjection]
        [UseFiltering]
        public IQueryable<ProjectCategory> GetProjectCategory()
        {
            return _projectCategoryService.GetAll();
        }
    }
}
