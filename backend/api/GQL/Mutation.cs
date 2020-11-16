using api.Services;
using api.Models;
using System.Collections.Generic;

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

        public Mutation(
            ProjectService projectService,
            EvaluationService evaluationService,
            ParticipantService participantService,
            QuestionService questionService,
            AnswerService answerService,
            QuestionTemplateService questionTemplateService
        )
        {
            _projectService = projectService;
            _evaluationService = evaluationService;
            _participantService = participantService;
            _questionService = questionService;
            _answerService = answerService;
            _questionTemplateService = questionTemplateService;
        }

        // TODO: This methods should not take azureUniqueId as parameter but get it from token
        public Evaluation CreateEvaluation(string name, string projectId, string azureUniqueId)
        {
            Project project = _projectService.GetProject(projectId);
            Evaluation evaluation = _evaluationService.Create(name, project);
            _participantService.Create(azureUniqueId, evaluation, Organization.All, Role.Facilitator);

            List<QuestionTemplate> questionTemplates = _questionTemplateService.ActiveQuestions();
            foreach (QuestionTemplate template in questionTemplates)
            {
                _questionService.Create(template, evaluation);
            }
            return evaluation;
        }

        public Evaluation ProgressEvaluation(string evaluationId)
        {
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

        public Answer CreateAnswer(Participant answeredBy, Progression progression, string questionId, Severity severity, string text)
        {
            Question question = _questionService.GetQuestion(questionId);
            return _answerService.Create(answeredBy, progression, question, severity, text);
        }
    }
}
