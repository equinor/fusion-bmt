using System;
using System.Linq;

using Xunit;

using api.Models;
using Action = api.Models.Action;
using api.Services;

namespace tests
{
    [Collection("Database collection")]
    public class ActionServiceTest
    {
        DatabaseFixture fixture;

        public ActionServiceTest(DatabaseFixture fixture)
        {
            this.fixture = fixture;
        }
        [Fact]
        public void GetQueryable()
        {
            ActionService actionService = new ActionService(fixture.context);

            IQueryable<Action> actionQueryable = actionService.GetAll();

            Assert.True(actionQueryable.Count() > 0);
        }

        [Fact]
        public void Create()
        {
            ParticipantService participantService = new ParticipantService(fixture.context);
            Participant participant = participantService.GetAll().First();
            QuestionService questionService = new QuestionService(fixture.context);
            Question question = questionService.GetAll().First();

            ActionService actionService = new ActionService(fixture.context);
            int nActionBefore = actionService.GetAll().Count();
            actionService.Create(participant, participant, "description", DateTimeOffset.UtcNow, "title", Priority.Low, question);
            int nActionsAfter = actionService.GetAll().Count();

            Assert.Equal(nActionBefore + 1, nActionsAfter);
        }

        [Fact]
        public void GetDoesNotExist()
        {
            ActionService ActionService = new ActionService(fixture.context);

            Assert.Throws<NotFoundInDBException>(() => ActionService.GetAction("some_action_id_that_does_not_exist"));
        }

        [Fact]
        public void GetExists()
        {
            ActionService actionService = new ActionService(fixture.context);
            ParticipantService participantService = new ParticipantService(fixture.context);
            Participant participant = participantService.GetAll().First();
            QuestionService questionService = new QuestionService(fixture.context);
            Question question = questionService.GetAll().First();

            Action actionCreate = actionService.Create(participant, participant, "description", DateTimeOffset.UtcNow, "title", Priority.High, question);

            Action actionGet = actionService.GetAction(actionCreate.Id).First();

            Assert.Equal(actionCreate, actionGet);
        }

        [Fact]
        public void EditAction()
        {
            ParticipantService participantService = new ParticipantService(fixture.context);
            Participant participant = participantService.GetAll().First();

            QuestionService questionService = new QuestionService(fixture.context);
            Question question = questionService.GetAll().First();

            ActionService actionService = new ActionService(fixture.context);
            string initialDescription = "initial description";
            Action action = actionService.Create(participant, participant, initialDescription, DateTimeOffset.UtcNow, "title", Priority.Medium, question);
            string actionId = action.Id;

            string newDescription = "new description";
            actionService.EditAction(action, participant, newDescription, DateTimeOffset.UtcNow, "title", false, false, Priority.High);

            Action resultingAction = actionService.GetAction(actionId).First();
            Assert.Equal(newDescription, resultingAction.Description);
        }

        [Fact]
        public void VoidAction()
        {
            ActionService actionService = new ActionService(fixture.context);

            Action action = actionService.GetAll().First();

            Action voidedAction = actionService.SetVoid(action, true);

            Assert.Equal(action.Id, voidedAction.Id);
            Assert.True(voidedAction.IsVoided);
        }
    }
}
