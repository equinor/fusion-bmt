using System;
using System.Linq;

using Microsoft.Extensions.Logging;

using api.Services;
using api.Models;
using Action = api.Models.Action;
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
        private readonly ActionService _actionService;
        private readonly NoteService _noteService;
        private readonly IAuthService _authService;
        private readonly ILogger _logger;

        public Mutation(
            ProjectService projectService,
            EvaluationService evaluationService,
            ParticipantService participantService,
            QuestionService questionService,
            AnswerService answerService,
            QuestionTemplateService questionTemplateService,
            ActionService actionService,
            NoteService noteService,
            IAuthService authService,
            ILogger<Mutation> logger
        )
        {
            _projectService = projectService;
            _evaluationService = evaluationService;
            _participantService = participantService;
            _questionService = questionService;
            _answerService = answerService;
            _questionTemplateService = questionTemplateService;
            _actionService = actionService;
            _noteService = noteService;
            _authService = authService;
            _logger = logger;
        }

        public Evaluation CreateEvaluation(string name, string projectId)
        {
            string azureUniqueId = _authService.GetOID();
            Project project = _projectService.GetProject(projectId);
            Evaluation evaluation = _evaluationService.Create(name, project);
            _participantService.Create(azureUniqueId, evaluation, Organization.All, Role.Facilitator);

            _questionService.CreateBulk(_questionTemplateService.ActiveQuestions(), evaluation);
            _logger.LogInformation($"Evaluation with id: {evaluation.Id} was created by azureId: {azureUniqueId}");
            return evaluation;
        }

        public Evaluation ProgressEvaluation(string evaluationId, Progression newProgression)
        {
            _authService.AssertIsFacilitator(evaluationId);
            Evaluation evaluation = _evaluationService.GetEvaluation(evaluationId);

            _evaluationService.ProgressEvaluation(evaluation, newProgression);

            _participantService.ProgressAllParticipants(evaluation, newProgression);

            if (newProgression.Equals(Progression.FollowUp))
            {
                _answerService.CreateFollowUpAnswers(evaluation);
            }

            return evaluation;
        }

        public Participant ProgressParticipant(string evaluationId, Progression newProgression)
        {
            string azureUniqueId = _authService.GetOID();
            Evaluation evaluation = _evaluationService.GetEvaluation(evaluationId);
            Participant participant = _participantService.GetParticipant(azureUniqueId, evaluation);

            Participant progressedParticipant = _participantService.ProgressParticipant(participant, newProgression);

            return progressedParticipant;
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

        public Answer SetAnswer(string questionId, Severity severity, string text, Progression progression)
        {
            IQueryable<Question> queryableQuestion = _questionService.GetQuestion(questionId);
            Question question = queryableQuestion.First();
            Evaluation evaluation = queryableQuestion.Select(q => q.Evaluation).First();
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

        public Action CreateAction(string questionId, string assignedToId, string description, DateTime dueDate, Priority priority, string title)
        {
            IQueryable<Question> queryableQuestion = _questionService.GetQuestion(questionId);
            Question question = queryableQuestion.First();
            Evaluation evaluation = queryableQuestion.Select(q => q.Evaluation).First();

            Participant assignedTo = _participantService.GetParticipant(assignedToId);

            return _actionService.Create(CurrentUser(evaluation), assignedTo, description, dueDate, title, priority, question);
        }

        public Action EditAction(string actionId, string assignedToId, string description, DateTime dueDate, string title, bool onHold, Priority priority)
        {
            IQueryable<Action> queryableAction = _actionService.GetAction(actionId);
            Action action = queryableAction.First();

            Participant assignedTo = _participantService.GetParticipant(assignedToId);

            return _actionService.EditAction(action, assignedTo, description, dueDate, title, onHold, priority);
        }

        public Note CreateNote(string actionId, string text)
        {
            IQueryable<Action> queryableAction = _actionService.GetAction(actionId);
            Action action = queryableAction.First();
            Evaluation evaluation = queryableAction.Select(a => a.Question.Evaluation).First();

            return _noteService.Create(CurrentUser(evaluation), text, action);
        }

        public Note EditNote(string noteId, string text)
        {
            Note note = _noteService.GetNote(noteId);
            return _noteService.EditNote(note, text);
        }

        private Participant CurrentUser(Evaluation evaluation)
        {
            string azureUniqueId = _authService.GetOID();
            return _participantService.GetParticipant(azureUniqueId, evaluation);
        }
    }
}
