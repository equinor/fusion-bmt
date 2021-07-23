using System;
using System.Linq;

using Xunit;

using api.Models;
using Action = api.Models.Action;
using api.Services;

namespace tests
{
    [Collection("UsesDbContext")]
    public class ActionServiceTest : DbContextTestSetup
    {
        [Fact]
        public void GetQueryable()
        {
            ActionService actionService = new ActionService(_context);

            IQueryable<Action> actionQueryable = actionService.GetAll();

            Assert.True(actionQueryable.Count() > 0);
        }

        [Fact]
        public void Create()
        {
            ParticipantService participantService = new ParticipantService(_context);
            Participant participant = participantService.GetAll().First();
            QuestionService questionService = new QuestionService(_context);
            Question question = questionService.GetAll().First();

            ActionService actionService = new ActionService(_context);
            int nActionBefore = actionService.GetAll().Count();
            actionService.Create(participant, participant, "description", DateTimeOffset.UtcNow, "title", Priority.Low, question);
            int nActionsAfter = actionService.GetAll().Count();

            Assert.Equal(nActionBefore + 1, nActionsAfter);
        }

        [Fact]
        public void GetDoesNotExist()
        {
            ActionService ActionService = new ActionService(_context);

            Assert.Throws<NotFoundInDBException>(() => ActionService.GetAction("some_action_id_that_does_not_exist"));
        }

        [Fact]
        public void GetExists()
        {
            ActionService actionService = new ActionService(_context);
            ParticipantService participantService = new ParticipantService(_context);
            Participant participant = participantService.GetAll().First();
            QuestionService questionService = new QuestionService(_context);
            Question question = questionService.GetAll().First();

            Action actionCreate = actionService.Create(participant, participant, "description", DateTimeOffset.UtcNow, "title", Priority.High, question);

            Action actionGet = actionService.GetAction(actionCreate.Id).First();

            Assert.Equal(actionCreate, actionGet);
        }

        [Fact]
        public void EditAction()
        {
            ParticipantService participantService = new ParticipantService(_context);
            Participant participant = participantService.GetAll().First();

            QuestionService questionService = new QuestionService(_context);
            Question question = questionService.GetAll().First();

            ActionService actionService = new ActionService(_context);
            string initialDescription = "initial description";
            Action action = actionService.Create(participant, participant, initialDescription, DateTimeOffset.UtcNow, "title", Priority.Medium, question);
            string actionId = action.Id;

            string newDescription = "new description";
            actionService.EditAction(action, participant, newDescription, DateTimeOffset.UtcNow, "title", false, false, Priority.High);

            Action resultingAction = actionService.GetAction(actionId).First();
            Assert.Equal(newDescription, resultingAction.Description);
        }

        [Fact]
        public void DeleteAction()
        {
            NoteService noteService = new NoteService(_context);
            ActionService actionService = new ActionService(_context);

            Action action = actionService.GetAll().Where(a => a.Notes.Count() > 0).First();
            Note note = action.Notes.First();

            Action deleted = actionService.Remove(action);

            Assert.Equal(action.Id, deleted.Id);
            Assert.Throws<NotFoundInDBException>(() => noteService.GetNote(note.Id));
        }
    }
}
