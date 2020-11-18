using System.Linq;
using HotChocolate.Data;

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
        private readonly AnswerService _answerService;

        public GraphQuery(
            ProjectService projectService,
            EvaluationService evaluationService,
            ParticipantService participantService,
            QuestionService questionService,
            AnswerService answerService
        )
        {
            _projectService = projectService;
            _evaluationService = evaluationService;
            _participantService = participantService;
            _questionService = questionService;
            _answerService = answerService;
        }

        [UseProjection]
        [UseFiltering]
        public IQueryable<Project> GetProjects()
        {
            return _projectService.GetAll();
        }

        public Project GetProject(string fusionProjectID)
        {
            return _projectService.EnsureCreated(fusionProjectID);
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
        public IQueryable<Answer> GetAnswers()
        {
            return _answerService.GetAll();
        }
    }
}
