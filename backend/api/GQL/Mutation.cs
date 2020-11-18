using System.Collections.Generic;
using System;
using Microsoft.AspNetCore.Http;
using Microsoft.Identity.Web;

using HotChocolate.AspNetCore.Authorization;

using api.Services;
using api.Models;
using api.Authentication;

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

        private readonly IHttpContextAccessor _contextAccessor;

        public Mutation(
            ProjectService projectService,
            EvaluationService evaluationService,
            ParticipantService participantService,
            QuestionService questionService,
            AnswerService answerService,
            QuestionTemplateService questionTemplateService,
            IHttpContextAccessor contextAccessor
        )
        {
            _projectService = projectService;
            _evaluationService = evaluationService;
            _participantService = participantService;
            _questionService = questionService;
            _answerService = answerService;
            _questionTemplateService = questionTemplateService;
            _contextAccessor = contextAccessor;
        }

        [Authorize(Policy = "Author")]
        public Evaluation CreateEvaluation(string name, string projectId, string azureUniqueId)
        {

            var httpContext = _contextAccessor.HttpContext;
            string oid = AuthUtil.GetOID(httpContext);
            Project project = _projectService.GetProject(projectId);
            Evaluation evaluation = _evaluationService.Create(name, project);
            _participantService.Create(oid, evaluation, Organization.All, Role.Facilitator);

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

        [Authorize(Policy = "Author")]
        public Answer CreateAnswer(Participant answeredBy, Progression progression, string questionId, Severity severity, string text)
        {
            var httpContext = _contextAccessor.HttpContext;
            string oid = AuthUtil.GetOID(httpContext);
            if (answeredBy.AzureUniqueId == oid)
            {
                Question question = _questionService.GetQuestion(questionId);
                return _answerService.Create(answeredBy, progression, question, severity, text);
            }
            else
            {
                throw new UnauthorizedAccessException($"User {httpContext.User.GetDisplayName()} not authorized to change this answer");
            }
        }
    }
}
