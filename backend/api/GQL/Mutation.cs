using System.Linq;
using api.Services;
using api.Models;
using api.Authorization;

namespace api.GQL
{
    public class Mutation
    {
        private readonly ProjectService _projectService;
        private readonly EvaluationService _evaluationService;
        private readonly ParticipantService _participantService;
        private readonly QuestionService _questionService;
        private readonly AnswerService _answerService;
        private readonly QuestionTemplateService _questionTemplateService;
        private readonly IAuthService _authService;

        public Mutation(
            ProjectService projectService,
            EvaluationService evaluationService,
            ParticipantService participantService,
            QuestionService questionService,
            AnswerService answerService,
            QuestionTemplateService questionTemplateService,
            IAuthService authService
        )
        {
            _projectService = projectService;
            _evaluationService = evaluationService;
            _participantService = participantService;
            _questionService = questionService;
            _answerService = answerService;
            _questionTemplateService = questionTemplateService;
            _authService = authService;
        }

        public Evaluation CreateEvaluation(string name, string projectId)
        {
            string azureUniqueId = _authService.GetOID();
            Project project = _projectService.GetProject(projectId);
            Evaluation evaluation = _evaluationService.Create(name, project);
            _participantService.Create(azureUniqueId, evaluation, Organization.All, Role.Facilitator);

            _questionService.CreateBulk(_questionTemplateService.ActiveQuestions(), evaluation);
            return evaluation;
        }

        public Evaluation ProgressEvaluation(string evaluationId)
        {
            _authService.AssertIsFacilitator(evaluationId);

            return _evaluationService.ProgressEvaluation(evaluationId);
        }

        public Participant CreateParticipant(string azureUniqueId, string evaluationId, Organization organization, Role role)
        {
            Evaluation evaluation = _evaluationService.GetEvaluation(evaluationId);
            return _participantService.Create(azureUniqueId, evaluation, organization, role);
        }

        public Participant DeleteParticipant(string participantId)
        {
            return _participantService.Remove(participantId);
        }

        public Answer SetAnswer(string questionId, Severity severity, string text)
        {
            string azureUniqueId = _authService.GetOID();

            IQueryable<Question> queryableQuestion = _questionService.GetQuestion(questionId);
            Question question = queryableQuestion.First();
            Evaluation evaluation = queryableQuestion.Select(q => q.Evaluation).First();
            Participant participant = _participantService.GetParticipant(azureUniqueId, evaluation);

            Answer answer;
            try
            {
                answer = _answerService.GetAnswer(question, participant, evaluation.Progression);
                _answerService.UpdateAnswer(answer, severity, text);
            }
            catch (NotFoundInDBException)
            {
                answer = _answerService.Create(participant, question, severity, text);
            }

            return answer;
        }
    }
}
