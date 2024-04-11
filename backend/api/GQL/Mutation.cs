using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using api.Services;
using api.Models;
using Action = api.Models.Action;
using api.Authorization;
using HotChocolate.Authorization;
using System.Threading.Tasks;

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
        private readonly BMTScoreService _indicatorService;

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
            BMTScoreService indicatorService,
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
            _indicatorService = indicatorService;
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
                name: name,
                project: project,
                previousEvaluationId: previousEvaluationId
            );

            _participantService.Create(
                azureUniqueId: azureUniqueId,
                evaluation: evaluation,
                organization: Organization.All,
                role: Role.Facilitator
            );

            var projectCategory = _projectCategoryService.Get(projectCategoryId);
            var questions = _questionTemplateService.ActiveQuestions(projectCategory);
            _questionService.CreateBulk(questions, evaluation);
            _questionService.SquashOrder(evaluation.Questions);

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
                _projectService.SetIndicatorEvaluation(evaluation.ProjectId, evaluation);
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

        public Evaluation SetEvaluationStatus(string evaluationId, Status newStatus)
        {
            Evaluation evaluation = _evaluationService.GetEvaluation(evaluationId);
            var roles = _authService.GetRoles();

            if (!roles.Contains("Role.Admin"))
            {
                Role[] canBePerformedBy = { Role.Facilitator };
                AssertCanPerformMutation(evaluation, canBePerformedBy);
            }

            _evaluationService.SetStatus(evaluation, newStatus);
            return evaluation;
        }

        public Project SetIndicatorEvaluation(string projectId, string evaluationId)
        {
            Evaluation evaluation = _evaluationService.GetEvaluation(evaluationId);

            if (evaluation.Progression != Progression.FollowUp)
            {
                string msg = "Evaluation must be in FollowUp progression to set as active indicator for project";
                throw new InvalidOperationException(msg);
            }

            var roles = _authService.GetRoles();

            if (!roles.Contains("Role.Admin"))
            {
                Role[] canBePerformedBy = { Role.Facilitator };
                AssertCanPerformMutation(evaluation, canBePerformedBy);
            }

            return _projectService.SetIndicatorEvaluation(projectId, evaluation);
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

        public Evaluation setEvaluationToAnotherProject(
            string evaluationId,
            string destinationProjectFusionId,
            string destinationProjectExternalId
        )
        {
            Evaluation evaluation = _evaluationService.GetEvaluation(evaluationId);

            Project destinationProject;
            try
            {
                try
                {
                    destinationProject = _projectService.GetProjectFromExternalId(destinationProjectExternalId);
                }
                catch (NotFoundInDBException)
                {
                    destinationProject = _projectService.GetProjectFromFusionId(destinationProjectFusionId);
                }
            }
            catch
            {
                destinationProject = _projectService.Create(destinationProjectExternalId, destinationProjectFusionId);
                _logger.LogInformation($"Created new project with externalId: {destinationProjectExternalId}");
            }
            Evaluation updatedEvaluation = _evaluationService.SetEvaluationToAnotherProject(evaluation, destinationProject);
            return updatedEvaluation;
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
                var previousSeverity = answer.Severity;
                _answerService.UpdateAnswer(answer, severity, text);

                if (ShouldUpdateEvaluationIndicatorActivity(evaluation, progression, severity, previousSeverity))
                {
                    UpdateEvaluationIndicatorActivity(evaluation);
                }
            }
            catch (NotFoundInDBException)
            {
                answer = _answerService.Create(currentUser, question, severity, text, progression);
                UpdateEvaluationIndicatorActivity(evaluation);
            }

            return answer;
        }

        private static bool ShouldUpdateEvaluationIndicatorActivity(
            Evaluation evaluation,
            Progression questionProgression,
            Severity newAnswerSeverity,
            Severity previousAnswerSeverity
        )
        {
            bool isQuestionInFollowUpProgression = questionProgression == Progression.FollowUp;
            bool isEvaluationInFollowUp = evaluation.Progression == Progression.FollowUp;
            bool isSeverityChanged = newAnswerSeverity != previousAnswerSeverity;

            return isQuestionInFollowUpProgression && isSeverityChanged && isEvaluationInFollowUp;
        }


        private void UpdateEvaluationIndicatorActivity(Evaluation evaluation)
        {
            _evaluationService.SetIndicatorActivity(evaluation);
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

        public Action VoidAction(string actionId)
        {
            /* Note that no related fields are loaded */
            IQueryable<Action> queryableAction = _actionService.GetAction(actionId);
            Action action = queryableAction.First();
            Evaluation evaluation = queryableAction.Select(q => q.Question.Evaluation).First();

            Role[] canBePerformedBy = { Role.Facilitator };
            AssertCanPerformMutation(evaluation, canBePerformedBy);

            _actionService.SetVoid(action, true);
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
         * These mutations will check if the user has the
         * user role Role.Admin in the jwt token. Note that
         * this role is different from the role used in the
         * application
         */
        private const string adminRole = "Role.Admin";


        [Authorize(Roles = new[] { adminRole })]
        public ProjectCategory CreateProjectCategory(string name)
        {
            return _projectCategoryService.Create(name);
        }


        [Authorize(Roles = new[] { adminRole })]
        public ProjectCategory DeleteProjectCategory(string projectCategoryId)
        {
            var projectCategory = _projectCategoryService.Get(projectCategoryId);
            return _projectCategoryService.Delete(projectCategory);
        }

        [Authorize(Roles = new[] { adminRole })]
        public ProjectCategory CopyProjectCategory(string newName, string projectCategoryId)
        {
            var other = _projectCategoryService.GetAll().Include(x => x.QuestionTemplates).Single(x => x.Id == projectCategoryId);
            return _projectCategoryService.CopyFrom(newName, other);
        }

        [Authorize(Roles = new[] { adminRole })]
        public QuestionTemplate CreateQuestionTemplate(
            Barrier barrier,
            Organization organization,
            string text,
            string supportNotes,
            string[] projectCategoryIds,
            int newOrder = 0
        )
        {
            var qt = _questionTemplateService.Create(barrier, organization, text, supportNotes, newOrder);

            foreach (var projectCategoryId in projectCategoryIds)
            {
                _questionTemplateService.AddToProjectCategory(qt.Id, projectCategoryId);
            }

            return qt;
        }

        [Authorize(Roles = new[] { adminRole })]
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

        [Authorize(Roles = new[] { adminRole })]
        public QuestionTemplate DeleteQuestionTemplate(string questionTemplateId)
        {
            QuestionTemplate questionTemplate = _questionTemplateService.GetQuestionTemplate(questionTemplateId);
            return _questionTemplateService.Delete(questionTemplate);
        }

        [Authorize(Roles = new[] { adminRole })]
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

        [Authorize(Roles = new[] { adminRole })]
        public QuestionTemplate AddToProjectCategory(
            string questionTemplateId,
            string projectCategoryId
        )
        {
            return _questionTemplateService.AddToProjectCategory(questionTemplateId, projectCategoryId);
        }

        [Authorize(Roles = new[] { adminRole })]
        public QuestionTemplate RemoveFromProjectCategories(
            string questionTemplateId,
            List<string> projectCategoryIds
        )
        {
            return _questionTemplateService.RemoveFromProjectCategories(questionTemplateId, projectCategoryIds);
        }

        public async Task<List<BMTScore>> GenerateBMTScores()
        {
            var scores = await _indicatorService.GenerateBMTScores();
            return scores;
        }

        public async Task<BMTScore> GenerateBMTScore(string projectId)
        {
            var score = await _indicatorService.GenerateBMTScore(projectId);
            return score;
        }

        /* Helpers */
        private Participant CurrentUser(Evaluation evaluation)
        {
            string azureUniqueId = _authService.GetOID();
            return _participantService.GetParticipant(azureUniqueId, evaluation);
        }

        private void AssertCanPerformMutation(Evaluation evaluation, Role[] validRoles)
        {
            string oid = _authService.GetOID();
            Role userRoleInEvaluation;

            try
            {
                userRoleInEvaluation = _participantService.GetParticipant(oid, evaluation).Role;
            }
            catch (NotFoundInDBException)
            {
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
