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

        public GraphQuery(
            ProjectService projectService,
            EvaluationService evaluationService,
            ParticipantService participantService
        )
        {
            _projectService = projectService;
            _evaluationService = evaluationService;
            _participantService = participantService;
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
    }
}
