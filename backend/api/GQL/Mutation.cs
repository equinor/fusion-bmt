using api.Services;
using api.Models;

namespace api.GQL
{
    public class Mutation
    {
        private readonly ProjectService _projectService;
        private readonly EvaluationService _evaluationService;
        private readonly ParticipantService _participantService;
        private readonly QuestionService _questionService;
        private readonly AnswerService _answerService;

        public Mutation(
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

        public Answer CreateAnswer(Participant answeredBy, Progression progression, string questionId, Severity severity, string text)
        {
            Question question = _questionService.GetQuestion(questionId);
            return _answerService.Create(answeredBy, progression, question, severity, text);
        }
    }
}
