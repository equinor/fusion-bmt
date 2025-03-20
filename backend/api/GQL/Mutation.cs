using api.Authorization;
using api.Models;
using api.Services;
using HotChocolate.Authorization;
using Microsoft.EntityFrameworkCore;
using Action = api.Models.Action;
using Barrier = api.Models.Barrier;

namespace api.GQL
{
    public class Mutation(
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
        BmtScoreService bmtScoreService,
        ILogger<Mutation> logger)
    {
        private readonly ILogger _logger = logger;

        /* Primary mutations - manipulating specific Evaluations */
        public Evaluation CreateEvaluation(
            string name,
            string projectId,
            string previousEvaluationId,
            string projectCategoryId
        )
        {
            var azureUniqueId = authService.GetOid();

            var project = projectService.GetProject(projectId);

            var evaluation = evaluationService.Create(
                name: name,
                project: project,
                previousEvaluationId: previousEvaluationId
            );

            participantService.Create(
                azureUniqueId: azureUniqueId,
                evaluation: evaluation,
                organization: Organization.All,
                role: Role.Facilitator
            );

            var projectCategory = projectCategoryService.Get(projectCategoryId);
            var questions = questionTemplateService.ActiveQuestions(projectCategory);
            questionService.CreateBulk(questions, evaluation);
            questionService.SquashOrder(evaluation.Questions);

            var log = $"Evaluation with id: {evaluation.Id} was created by azureId: {azureUniqueId}";
            _logger.LogInformation(log);

            return evaluation;
        }

        public Evaluation ProgressEvaluation(string evaluationId, Progression newProgression)
        {
            var evaluation = evaluationService.GetEvaluation(evaluationId);

            Role[] canBePerformedBy = [Role.Facilitator];
            AssertCanPerformMutation(evaluation, canBePerformedBy);

            evaluationService.ProgressEvaluation(evaluation, newProgression);

            participantService.ProgressAllParticipants(evaluation, newProgression);

            if (newProgression.Equals(Progression.FollowUp))
            {
                evaluationService.SetWorkshopCompleteDate(evaluation);
                answerService.CreateFollowUpAnswers(evaluation);
                projectService.SetIndicatorEvaluation(evaluation.ProjectId, evaluation);
            }

            return evaluation;
        }

        public Evaluation SetSummary(string evaluationId, string summary)
        {
            var evaluation = evaluationService.GetEvaluation(evaluationId);

            Role[] canBePerformedBy = [Role.Facilitator];
            AssertCanPerformMutation(evaluation, canBePerformedBy);

            evaluationService.SetSummary(evaluation, summary);

            return evaluation;
        }

        public Evaluation SetEvaluationStatus(string evaluationId, Status newStatus)
        {
            var evaluation = evaluationService.GetEvaluation(evaluationId);
            var roles = authService.GetRoles();

            if (!roles.Contains("Role.Admin"))
            {
                Role[] canBePerformedBy = [Role.Facilitator];
                AssertCanPerformMutation(evaluation, canBePerformedBy);
            }

            evaluationService.SetStatus(evaluation, newStatus);

            return evaluation;
        }

        public Project SetIndicatorEvaluation(string projectId, string evaluationId)
        {
            var evaluation = evaluationService.GetEvaluation(evaluationId);

            if (evaluation.Progression != Progression.FollowUp && evaluation.Progression != Progression.Finished)
            {
                var msg =
                    "Evaluation must be in FollowUp or Finished progression to set as active indicator for project";

                throw new InvalidOperationException(msg);
            }

            var roles = authService.GetRoles();

            if (!roles.Contains("Role.Admin"))
            {
                Role[] canBePerformedBy = [Role.Facilitator];
                AssertCanPerformMutation(evaluation, canBePerformedBy);
            }

            return projectService.SetIndicatorEvaluation(projectId, evaluation);
        }

        public Participant ProgressParticipant(string evaluationId, Progression newProgression)
        {
            var azureUniqueId = authService.GetOid();
            var evaluation = evaluationService.GetEvaluation(evaluationId);
            var participant = participantService.GetParticipant(azureUniqueId, evaluation);

            Role[] canBePerformedBy = [Role.Facilitator, Role.OrganizationLead, Role.Participant];
            AssertCanPerformMutation(evaluation, canBePerformedBy);

            var progressedParticipant = participantService.ProgressParticipant(participant, newProgression);

            return progressedParticipant;
        }

        public Participant CreateParticipant(string azureUniqueId, string evaluationId, Organization organization,
                                             Role role)
        {
            var evaluation = evaluationService.GetEvaluation(evaluationId);

            var isAdmin = authService.GetRoles().Contains("Role.Admin");

            if (!isAdmin)
            {
                Role[] canBePerformedBy = [Role.Facilitator, Role.OrganizationLead];
                AssertCanPerformMutation(evaluation, canBePerformedBy);
            }

            return participantService.Create(azureUniqueId, evaluation, organization, role);
        }

        public Evaluation SetEvaluationToAnotherProject(
            string evaluationId,
            string destinationProjectFusionId,
            string destinationProjectExternalId
        )
        {
            var evaluation = evaluationService.GetEvaluation(evaluationId);

            Project destinationProject;

            try
            {
                try
                {
                    destinationProject = projectService.GetProjectFromExternalId(destinationProjectExternalId);
                }
                catch (NotFoundInDBException)
                {
                    destinationProject = projectService.GetProjectFromFusionId(destinationProjectFusionId);
                }
            }
            catch
            {
                destinationProject = projectService.Create(destinationProjectExternalId, destinationProjectFusionId);
                _logger.LogInformation($"Created new project with externalId: {destinationProjectExternalId}");
            }

            var updatedEvaluation =
                evaluationService.SetEvaluationToAnotherProject(evaluation, destinationProject);

            return updatedEvaluation;
        }

        public Participant DeleteParticipant(string participantId)
        {
            var evaluation = participantService.GetAll()
                                               .Where(p => p.Id.Equals(participantId))
                                               .Select(p => p.Evaluation)
                                               .First()
                ;

            Role[] canBePerformedBy = [Role.Facilitator, Role.OrganizationLead];
            AssertCanPerformMutation(evaluation, canBePerformedBy);

            var subject = participantService.GetParticipant(participantId);

            /* Safeguard against deleting the last Facilitator */
            if (subject.Role.Equals(Role.Facilitator))
            {
                var facilitators = evaluation.Participants
                                             .Where(p => p.Role.Equals(Role.Facilitator))
                                             .Count()
                    ;

                if (facilitators < 2)
                {
                    var msg = "Cannot delete last Facilitator in Evaluation";

                    throw new InvalidOperationException(msg);
                }
            }

            return participantService.Remove(participantId);
        }

        public Answer SetAnswer(string questionId, Severity severity, string text, Progression progression)
        {
            var queryableQuestion = questionService.GetQuestion(questionId);
            var question = queryableQuestion.First();
            var evaluation = queryableQuestion.Select(q => q.Evaluation).First();

            Role[] canBePerformedBy = [Role.Facilitator, Role.Participant, Role.OrganizationLead];

            var isAdmin = authService.GetRoles().Contains("Role.Admin");

            if (!isAdmin)
            {
                AssertCanPerformMutation(evaluation, canBePerformedBy);
            }

            var currentUser = CurrentUser(evaluation, isAdmin);
            Answer answer;

            try
            {
                answer = answerService.GetAnswer(question, currentUser, progression, isAdmin);
                var previousSeverity = answer.Severity;
                answerService.UpdateAnswer(answer, severity, text);

                if (ShouldUpdateEvaluationIndicatorActivity(evaluation, progression, severity, previousSeverity))
                {
                    UpdateEvaluationIndicatorActivity(evaluation);
                }
            }
            catch (NotFoundInDBException)
            {
                if (currentUser == null && isAdmin)
                {
                    var azureUniqueId = authService.GetOid();

                    var newUser = participantService.Create(
                        azureUniqueId: azureUniqueId,
                        evaluation: evaluation,
                        organization: Organization.All,
                        role: Role.Facilitator
                    );

                    answer = answerService.Create(newUser, question, severity, text, progression);
                }
                else
                {
                    if (currentUser != null)
                    {
                        answer = answerService.Create(currentUser, question, severity, text, progression);
                    }
                    else
                    {
                        throw new Exception($"You must be a participant in order to create answers");
                    }
                }

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
            var isQuestionInFollowUpProgression = questionProgression == Progression.FollowUp;
            var isEvaluationInFollowUp = evaluation.Progression == Progression.FollowUp;
            var isSeverityChanged = newAnswerSeverity != previousAnswerSeverity;

            return isQuestionInFollowUpProgression && isSeverityChanged && isEvaluationInFollowUp;
        }

        private void UpdateEvaluationIndicatorActivity(Evaluation evaluation)
        {
            evaluationService.SetIndicatorActivity(evaluation);
        }

        public Action CreateAction(
            string questionId,
            string assignedToId,
            string description,
            DateTimeOffset dueDate,
            Priority priority,
            string title)
        {
            var queryableQuestion = questionService.GetQuestion(questionId);
            var question = queryableQuestion.First();
            var evaluation = queryableQuestion.Select(q => q.Evaluation).First();

            Role[] canBePerformedBy = [Role.Facilitator, Role.Participant, Role.OrganizationLead];
            AssertCanPerformMutation(evaluation, canBePerformedBy);

            var assignedTo = participantService.GetParticipant(assignedToId);

            return actionService.Create(CurrentUser(evaluation), assignedTo, description, dueDate, title, priority,
                                        question);
        }

        public Action EditAction(
            string actionId,
            string assignedToId,
            string azureUniqueId,
            string description,
            DateTimeOffset dueDate,
            string title,
            bool onHold,
            bool completed,
            Priority priority)
        {
            var queryableAction = actionService.GetAction(actionId);
            var action = queryableAction.First();
            var evaluation = queryableAction.Select(q => q.Question.Evaluation).First();

            Role[] canBePerformedBy = [Role.Facilitator, Role.Participant, Role.OrganizationLead];
            var isAdmin = authService.GetRoles().Contains("Role.Admin");

            if (!isAdmin)
            {
                AssertCanPerformMutation(evaluation, canBePerformedBy);
            }

            Participant assignedTo;

            try
            {
                assignedTo = participantService.GetParticipant(assignedToId);
            }
            catch (NotFoundInDBException)
            {
                assignedTo = participantService.Create(
                    azureUniqueId: azureUniqueId,
                    evaluation: evaluation,
                    organization: Organization.All,
                    role: Role.Participant
                );
            }

            return actionService.EditAction(action, assignedTo, description, dueDate, title, onHold, completed,
                                            priority);
        }

        public Action VoidAction(string actionId)
        {
            /* Note that no related fields are loaded */
            var queryableAction = actionService.GetAction(actionId);
            var action = queryableAction.First();
            var evaluation = queryableAction.Select(q => q.Question.Evaluation).First();

            Role[] canBePerformedBy = [Role.Facilitator];
            AssertCanPerformMutation(evaluation, canBePerformedBy);

            actionService.SetVoid(action, true);

            return action;
        }

        public Note CreateNote(string actionId, string text)
        {
            var queryableAction = actionService.GetAction(actionId);
            var action = queryableAction.First();
            var evaluation = queryableAction.Select(a => a.Question.Evaluation).First();

            Role[] canBePerformedBy = [Role.Facilitator, Role.Participant, Role.OrganizationLead];
            AssertCanPerformMutation(evaluation, canBePerformedBy);

            return noteService.Create(CurrentUser(evaluation), text, action);
        }

        public ClosingRemark CreateClosingRemark(string actionId, string text)
        {
            var queryableAction = actionService.GetAction(actionId);
            var action = queryableAction.First();
            var evaluation = queryableAction.Select(a => a.Question.Evaluation).First();

            Role[] canBePerformedBy = [Role.Facilitator, Role.Participant, Role.OrganizationLead];
            AssertCanPerformMutation(evaluation, canBePerformedBy);

            return closingRemarkService.Create(CurrentUser(evaluation), text, action);
        }

        /* Admin mutations
         *
         * These mutations will check if the user has the
         * user role Role.Admin in the jwt token. Note that
         * this role is different from the role used in the
         * application
         */
        private const string AdminRole = "Role.Admin";

        [Authorize(Roles = [AdminRole])]
        public ProjectCategory CreateProjectCategory(string name)
        {
            return projectCategoryService.Create(name);
        }

        [Authorize(Roles = [AdminRole])]
        public ProjectCategory DeleteProjectCategory(string projectCategoryId)
        {
            var projectCategory = projectCategoryService.Get(projectCategoryId);

            return projectCategoryService.Delete(projectCategory);
        }

        [Authorize(Roles = [AdminRole])]
        public ProjectCategory CopyProjectCategory(string newName, string projectCategoryId)
        {
            var other = projectCategoryService.GetAll().Include(x => x.QuestionTemplates)
                                              .Single(x => x.Id == projectCategoryId);

            return projectCategoryService.CopyFrom(newName, other);
        }

        [Authorize(Roles = [AdminRole])]
        public QuestionTemplate CreateQuestionTemplate(
            Barrier barrier,
            Organization organization,
            string text,
            string supportNotes,
            string[] projectCategoryIds,
            int newOrder = 0
        )
        {
            var qt = questionTemplateService.Create(barrier, organization, text, supportNotes, newOrder);

            foreach (var projectCategoryId in projectCategoryIds)
            {
                questionTemplateService.AddToProjectCategory(qt.Id, projectCategoryId);
            }

            return qt;
        }

        [Authorize(Roles = [AdminRole])]
        public QuestionTemplate EditQuestionTemplate(
            string questionTemplateId,
            Barrier barrier,
            Organization organization,
            string text,
            string supportNotes,
            Status status
        )
        {
            var questionTemplate = questionTemplateService
                                   .GetAll()
                                   .Include(x => x.ProjectCategories)
                                   .Single(x => x.Id == questionTemplateId)
                ;

            return questionTemplateService.Edit(
                questionTemplate,
                barrier,
                organization,
                text,
                supportNotes,
                status
            );
        }

        [Authorize(Roles = [AdminRole])]
        public QuestionTemplate DeleteQuestionTemplate(string questionTemplateId)
        {
            var questionTemplate = questionTemplateService.GetQuestionTemplate(questionTemplateId);

            return questionTemplateService.Delete(questionTemplate);
        }

        [Authorize(Roles = [AdminRole])]
        public QuestionTemplate ReorderQuestionTemplate(
            string questionTemplateId,
            string newNextQuestionTemplateId
        )
        {
            var questionTemplate = questionTemplateService.GetQuestionTemplate(questionTemplateId);

            if (string.IsNullOrEmpty(newNextQuestionTemplateId))
            {
                return questionTemplateService.ReorderQuestionTemplate(questionTemplate);
            }
            else
            {
                var newNextQuestionTemplate =
                    questionTemplateService.GetQuestionTemplate(newNextQuestionTemplateId);

                return questionTemplateService.ReorderQuestionTemplate(questionTemplate, newNextQuestionTemplate);
            }
        }

        [Authorize(Roles = [AdminRole])]
        public QuestionTemplate AddToProjectCategory(
            string questionTemplateId,
            string projectCategoryId
        )
        {
            return questionTemplateService.AddToProjectCategory(questionTemplateId, projectCategoryId);
        }

        [Authorize(Roles = [AdminRole])]
        public QuestionTemplate RemoveFromProjectCategories(
            string questionTemplateId,
            List<string> projectCategoryIds
        )
        {
            return questionTemplateService.RemoveFromProjectCategories(questionTemplateId, projectCategoryIds);
        }

        public async Task<List<BMTScore>> GenerateBmtScores()
        {
            var scores = await bmtScoreService.GenerateBmtScores();

            return scores;
        }

        public async Task<BMTScore> GenerateBmtScore(string projectId)
        {
            var score = await bmtScoreService.GenerateBmtScore(projectId);

            return score;
        }

        /* Helpers */
        private Participant CurrentUser(Evaluation evaluation, bool isAdmin = false)
        {
            var azureUniqueId = authService.GetOid();

            return participantService.GetParticipant(azureUniqueId, evaluation, isAdmin);
        }

        private void AssertCanPerformMutation(Evaluation evaluation, Role[] validRoles)
        {
            var oid = authService.GetOid();
            Role userRoleInEvaluation;

            try
            {
                userRoleInEvaluation = participantService.GetParticipant(oid, evaluation).Role;
            }
            catch (NotFoundInDBException)
            {
                var msg = "Non-participants cannot perform mutations on Evaluation";

                throw new UnauthorizedAccessException(msg);
            }

            if (!validRoles.Contains(userRoleInEvaluation))
            {
                var msg = "{0} are not allowed to perform this operation";

                throw new UnauthorizedAccessException(String.Format(msg, userRoleInEvaluation));
            }
        }
    }
}
