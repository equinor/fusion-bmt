using api.Models;
using api.Services;
using Action = api.Models.Action;

namespace api.GQL;

public class GraphQuery(
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
    ILogger<GraphQuery> logger)
{
    private readonly ILogger _logger = logger;

    [UseProjection]
    [UseFiltering]
    public IQueryable<Project> GetProjects()
    {
        return projectService.GetAll();
    }

    public Project GetProject(string fusionProjectID, string externalID)
    {
        Project project;

        try
        {
            try
            {
                project = projectService.GetProjectFromExternalId(externalID);
            }
            catch (NotFoundInDBException)
            {
                project = projectService.GetProjectFromFusionId(fusionProjectID);
            }
        }
        catch (NotFoundInDBException)
        {
            project = projectService.Create(externalID, fusionProjectID);
            _logger.LogInformation($"Created new project with fusionProjectId: {fusionProjectID}");
        }

        return project;
    }

    [UseProjection]
    [UseFiltering]
    public IQueryable<Evaluation> GetEvaluations()
    {
        return evaluationService.GetAll();
    }

    [UseProjection]
    [UseFiltering]
    public IQueryable<Participant> GetParticipants()
    {
        return participantService.GetAll();
    }

    [UseProjection]
    [UseFiltering]
    public IQueryable<Question> GetQuestions()
    {
        return questionService.GetAll();
    }

    [UseProjection]
    [UseFiltering]
    public IQueryable<QuestionTemplate> GetQuestionTemplates()
    {
        return questionTemplateService.GetAll();
    }

    [UseProjection]
    [UseFiltering]
    public IQueryable<Answer> GetAnswers()
    {
        return answerService.GetAll();
    }

    [UseProjection]
    [UseFiltering]
    public IQueryable<Action> GetActions()
    {
        return actionService.GetAll();
    }

    [UseProjection]
    [UseFiltering]
    public IQueryable<Note> GetNotes()
    {
        return noteService.GetAll();
    }

    [UseProjection]
    [UseFiltering]
    public IQueryable<ClosingRemark> GetClosingRemarks()
    {
        return closingRemarkService.GetAll();
    }

    [UseProjection]
    [UseFiltering]
    public IQueryable<ProjectCategory> GetProjectCategory()
    {
        return projectCategoryService.GetAll();
    }
}
