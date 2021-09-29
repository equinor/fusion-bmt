using System;
using System.Linq;

using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

using api.Services;
using api.Models;
using Action = api.Models.Action;
using api.Authorization;

namespace api.GQL
{
    public class Mutation
    {
        /* Primary Services*/
        private readonly ProjectService _projectService;
        private readonly EvaluationService _evaluationService;
        private readonly ParticipantService _participantService;
        private readonly QuestionService _questionService;
        private readonly AnswerService _answerService;
        private readonly ActionService _actionService;
        private readonly NoteService _noteService;
        private readonly ClosingRemarkService _closingRemarkService;

        /* Admin Services */
        private readonly QuestionTemplateService _questionTemplateService;
        private readonly ProjectCategoryService _projectCategoryService;

        /* Other Services */
        private readonly IAuthService _authService;
        private readonly ILogger _logger;

        public Mutation(
            ProjectService projectService,
            EvaluationService evaluationService,
            ParticipantService participantService,
            QuestionService questionService,
            AnswerService answerService,
            ActionService actionService,
            NoteService noteService,
            ClosingRemarkService closingRemarkService,
            QuestionTemplateService questionTemplateService,
            ProjectCategoryService projectCategoryService,
            IAuthService authService,
            ILogger<Mutation> logger
        )
        {
            _projectService = projectService;
            _evaluationService = evaluationService;
            _participantService = participantService;
            _questionService = questionService;
            _answerService = answerService;
            _actionService = actionService;
            _noteService = noteService;
            _closingRemarkService = closingRemarkService;
            _questionTemplateService = questionTemplateService;
            _projectCategoryService = projectCategoryService;
            _authService = authService;
            _logger = logger;
        }

        /* Primary mutations - manupulating specific Evaluations */
        public Evaluation CreateEvaluation(
            string name,
            string projectId,
            string previousEvaluationId,
            string projectCategoryId
        )
        {
            var azureUniqueId = _authService.GetOID();

            var project = _projectService.GetProject(projectId);
            var evaluation = _evaluationService.Create(
                name:                 name,
                project:              project,
                previousEvaluationId: previousEvaluationId
            );

            _participantService.Create(
                azureUniqueId: azureUniqueId,
                evaluation:    evaluation,
                organization:  Organization.All,
                role:          Role.Facilitator
            );

            var projectCategory = _projectCategoryService.Get(projectCategoryId);
            var questions = _questionTemplateService.ActiveQuestions(projectCategory);
            _questionService.CreateBulk(questions, evaluation);

            var log = $"Evaluation with id: {evaluation.Id} was created by azureId: {azureUniqueId}";
            _logger.LogInformation(log);
            return evaluation;
        }

        public Evaluation ProgressEvaluation(string evaluationId, Progression newProgression)
        {
            Evaluation evaluation = _evaluationService.GetEvaluation(evaluationId);

            Role[] canBePerformedBy = { Role.Facilitator };
            AssertCanPerformMutation(evaluation, canBePerformedBy);

            _evaluationService.ProgressEvaluation(evaluation, newProgression);

            _participantService.ProgressAllParticipants(evaluation, newProgression);

            if (newProgression.Equals(Progression.FollowUp))
            {
                _evaluationService.SetWorkshopCompleteDate(evaluation);
                _answerService.CreateFollowUpAnswers(evaluation);
            }

            return evaluation;
        }

        public Evaluation SetSummary(string evaluationId, string summary)
        {
            Evaluation evaluation = _evaluationService.GetEvaluation(evaluationId);

            Role[] canBePerformedBy = { Role.Facilitator };
            AssertCanPerformMutation(evaluation, canBePerformedBy);

            _evaluationService.SetSummary(evaluation, summary);
            return evaluation;
        }

        public Participant ProgressParticipant(string evaluationId, Progression newProgression)
        {
            string azureUniqueId = _authService.GetOID();
            Evaluation evaluation = _evaluationService.GetEvaluation(evaluationId);
            Participant participant = _participantService.GetParticipant(azureUniqueId, evaluation);

            Role[] canBePerformedBy = { Role.Facilitator, Role.OrganizationLead, Role.Participant };
            AssertCanPerformMutation(evaluation, canBePerformedBy);

            Participant progressedParticipant = _participantService.ProgressParticipant(participant, newProgression);

            return progressedParticipant;
        }

        public Participant CreateParticipant(string azureUniqueId, string evaluationId, Organization organization, Role role)
        {
            Evaluation evaluation = _evaluationService.GetEvaluation(evaluationId);

            Role[] canBePerformedBy = { Role.Facilitator, Role.OrganizationLead };
            AssertCanPerformMutation(evaluation, canBePerformedBy);

            return _participantService.Create(azureUniqueId, evaluation, organization, role);
        }

        public Participant DeleteParticipant(string participantId)
        {
            Evaluation evaluation = _participantService.GetAll()
                .Where(p => p.Id.Equals(participantId))
                .Select(p => p.Evaluation)
                .First()
            ;

            Role[] canBePerformedBy = { Role.Facilitator, Role.OrganizationLead };
            AssertCanPerformMutation(evaluation, canBePerformedBy);

            Participant subject = _participantService.GetParticipant(participantId);

            /* Safeguard against deleting the last Facilitator */
            if (subject.Role.Equals(Role.Facilitator))
            {
                int facilitators = evaluation.Participants
                    .Where(p => p.Role.Equals(Role.Facilitator))
                    .Count()
                ;

                if (facilitators < 2)
                {
                    string msg = "Cannot delete last Facilitator in Evaluation";
                    throw new InvalidOperationException(msg);

                }
            }

            return _participantService.Remove(participantId);
        }

        public Answer SetAnswer(string questionId, Severity severity, string text, Progression progression)
        {
            IQueryable<Question> queryableQuestion = _questionService.GetQuestion(questionId);
            Question question = queryableQuestion.First();
            Evaluation evaluation = queryableQuestion.Select(q => q.Evaluation).First();

            Role[] canBePerformedBy = { Role.Facilitator, Role.Participant, Role.OrganizationLead };
            AssertCanPerformMutation(evaluation, canBePerformedBy);

            Participant currentUser = CurrentUser(evaluation);
            Answer answer;
            try
            {
                answer = _answerService.GetAnswer(question, currentUser, progression);
                _answerService.UpdateAnswer(answer, severity, text);
            }
            catch (NotFoundInDBException)
            {
                answer = _answerService.Create(currentUser, question, severity, text, progression);
            }

            return answer;
        }

        public Action CreateAction(string questionId, string assignedToId, string description, DateTimeOffset dueDate, Priority priority, string title)
        {
            IQueryable<Question> queryableQuestion = _questionService.GetQuestion(questionId);
            Question question = queryableQuestion.First();
            Evaluation evaluation = queryableQuestion.Select(q => q.Evaluation).First();

            Role[] canBePerformedBy = { Role.Facilitator, Role.Participant, Role.OrganizationLead };
            AssertCanPerformMutation(evaluation, canBePerformedBy);

            Participant assignedTo = _participantService.GetParticipant(assignedToId);

            return _actionService.Create(CurrentUser(evaluation), assignedTo, description, dueDate, title, priority, question);
        }

        public Action EditAction(string actionId, string assignedToId, string description, DateTimeOffset dueDate, string title, bool onHold, bool completed, Priority priority)
        {
            IQueryable<Action> queryableAction = _actionService.GetAction(actionId);
            Action action = queryableAction.First();
            Evaluation evaluation = queryableAction.Select(q => q.Question.Evaluation).First();

            Role[] canBePerformedBy = { Role.Facilitator, Role.Participant, Role.OrganizationLead };
            AssertCanPerformMutation(evaluation, canBePerformedBy);

            Participant assignedTo = _participantService.GetParticipant(assignedToId);

            return _actionService.EditAction(action, assignedTo, description, dueDate, title, onHold, completed, priority);
        }

        public Action DeleteAction(string actionId)
        {
            /* Note that no related fields are loaded */
            IQueryable<Action> queryableAction = _actionService.GetAction(actionId);
            Action action = queryableAction.First();
            Evaluation evaluation = queryableAction.Select(q => q.Question.Evaluation).First();

            Role[] canBePerformedBy = { Role.Facilitator };
            AssertCanPerformMutation(evaluation, canBePerformedBy);

             _actionService.Remove(action);
             return action;
        }

        public Note CreateNote(string actionId, string text)
        {
            IQueryable<Action> queryableAction = _actionService.GetAction(actionId);
            Action action = queryableAction.First();
            Evaluation evaluation = queryableAction.Select(a => a.Question.Evaluation).First();

            Role[] canBePerformedBy = { Role.Facilitator, Role.Participant, Role.OrganizationLead };
            AssertCanPerformMutation(evaluation, canBePerformedBy);

            return _noteService.Create(CurrentUser(evaluation), text, action);
        }

        public ClosingRemark CreateClosingRemark(string actionId, string text)
        {
            IQueryable<Action> queryableAction = _actionService.GetAction(actionId);
            Action action = queryableAction.First();
            Evaluation evaluation = queryableAction.Select(a => a.Question.Evaluation).First();

            Role[] canBePerformedBy = { Role.Facilitator, Role.Participant, Role.OrganizationLead };
            AssertCanPerformMutation(evaluation, canBePerformedBy);

            return _closingRemarkService.Create(CurrentUser(evaluation), text, action);
        }

        /* Admin mutations
         *
         * There are no role based restictions to these mutations as the
         * concept "Role" only exists withing an Evaluation.
         */
        public ProjectCategory CreateProjectCategory(string name)
        {
            return _projectCategoryService.Create(name);
        }

        public ProjectCategory DeleteProjectCategory(string projectCategoryId)
        {
            var projectCategory = _projectCategoryService.Get(projectCategoryId);
            return _projectCategoryService.Delete(projectCategory);
        }

        public ProjectCategory CopyProjectCategory(string newName, string projectCategoryId)
        {
            var other = _projectCategoryService.GetAll().Include(x => x.QuestionTemplates).Single(x => x.Id ==projectCategoryId);
            return _projectCategoryService.CopyFrom(newName, other);
        }

        public QuestionTemplate CreateQuestionTemplate(Barrier barrier, Organization organization, string text, string supportNotes, string[] projectCategoryIds)
        {
            var qt = _questionTemplateService.Create(barrier, organization, text, supportNotes);

            foreach (var projectCategoryId in projectCategoryIds)
            {
                _questionTemplateService.AddToProjectCategory(qt.Id, projectCategoryId);
            }

            return qt;
        }

        public QuestionTemplate EditQuestionTemplate(
            string questionTemplateId,
            Barrier barrier,
            Organization organization,
            string text,
            string supportNotes,
            Status status
        )
        {
            var questionTemplate = _questionTemplateService
                .GetAll()
                .Include(x => x.ProjectCategories)
                .Single(x => x.Id == questionTemplateId)
            ;
            return _questionTemplateService.Edit(
                questionTemplate,
                barrier,
                organization,
                text,
                supportNotes,
                status
            );
        }

        public QuestionTemplate DeleteQuestionTemplate(string questionTemplateId)
        {
            QuestionTemplate questionTemplate = _questionTemplateService.GetQuestionTemplate(questionTemplateId);
            return _questionTemplateService.Delete(questionTemplate);
        }

        public QuestionTemplate ReorderQuestionTemplate(
            string questionTemplateId,
            string newNextQuestionTemplateId
        )
        {
            QuestionTemplate questionTemplate = _questionTemplateService.GetQuestionTemplate(questionTemplateId);
            if (string.IsNullOrEmpty(newNextQuestionTemplateId))
            {
                return _questionTemplateService.ReorderQuestionTemplate(questionTemplate);
            }
            else
            {
                QuestionTemplate newNextQuestionTemplate = _questionTemplateService.GetQuestionTemplate(newNextQuestionTemplateId);
                return _questionTemplateService.ReorderQuestionTemplate(questionTemplate, newNextQuestionTemplate);
            }
        }

        public QuestionTemplate AddToProjectCategory(
            string questionTemplateId,
            string projectCategoryId
        )
        {
            return _questionTemplateService.AddToProjectCategory(questionTemplateId, projectCategoryId);
        }

        public QuestionTemplate RemoveFromProjectCategory(
            string questionTemplateId,
            string projectCategoryId
        )
        {
            return _questionTemplateService.RemoveFromProjectCategory(questionTemplateId, projectCategoryId);
        }

        /* Helpers */
        private Participant CurrentUser(Evaluation evaluation)
        {
            string azureUniqueId = _authService.GetOID();
            return _participantService.GetParticipant(azureUniqueId, evaluation);
        }

        private void AssertCanPerformMutation(Evaluation evaluation, Role[] validRoles) {
            string oid = _authService.GetOID();
            Role userRoleInEvaluation;

            try
            {
                userRoleInEvaluation = _participantService.GetParticipant(oid, evaluation).Role;
            }
            catch(NotFoundInDBException) {
                string msg = "Non-participants cannot perform mutations on Evaluation";
                throw new UnauthorizedAccessException(msg);
            }

            if (!validRoles.Contains(userRoleInEvaluation))
            {
                string msg = "{0} are not allowed to perform this operation";
                throw new UnauthorizedAccessException(String.Format(msg, userRoleInEvaluation));
            };
        }
    }
}
