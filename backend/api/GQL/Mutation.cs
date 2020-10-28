using api.Services;
using api.Models;

namespace api.GQL
{
    public class Mutation
    {
        private readonly ProjectService _projectService;
        private readonly EvaluationService _evaluationService;
        private readonly ParticipantService _participantService;

        public Mutation(
            ProjectService projectService,
            EvaluationService evaluationService,
            ParticipantService participantService
        )
        {
            _projectService = projectService;
            _evaluationService = evaluationService;
            _participantService = participantService;

        }

        public Evaluation CreateEvaluation(string name, string projectId, Participant creator)
        {
            Project project = _projectService.GetProject(projectId);
            return _evaluationService.Create(name, project, creator);
        }

        public Participant CreateParticipant(string fusionPersonId, string evaluationId, Organization organization, Role role)
        {
            Evaluation evaluation = _evaluationService.GetEvaluation(evaluationId);
            return _participantService.Create(fusionPersonId, evaluation, organization, role);
        }
    }
}
