using System;
using System.Linq;

using Xunit;

using api.Models;
using Action = api.Models.Action;
using api.Services;

namespace tests
{
    [Collection("Database collection")]
    public class ClosingRemarkServiceTest
    {
        DatabaseFixture fixture;

        public ClosingRemarkServiceTest(DatabaseFixture fixture)
        {
            this.fixture = fixture;
        }
        [Fact]
        public void GetQueryable()
        {
            ClosingRemarkService closingRemarkService = new ClosingRemarkService(fixture.context);

            IQueryable<ClosingRemark> closingRemarkQueryable = closingRemarkService.GetAll();

            Assert.True(closingRemarkQueryable.Count() > 0);
        }

        [Fact]
        public void Create()
        {
            ParticipantService participantService = new ParticipantService(fixture.context);
            Participant participant = participantService.GetAll().First();
            ActionService actionService = new ActionService(fixture.context);
            Action action = actionService.GetAll().First();

            ClosingRemarkService closingRemarkService = new ClosingRemarkService(fixture.context);
            int nClosingRemarksBefore = closingRemarkService.GetAll().Count();
            closingRemarkService.Create(participant, "text", action);
            int nClosingRemarksAfter = closingRemarkService.GetAll().Count();

            Assert.Equal(nClosingRemarksBefore + 1, nClosingRemarksAfter);
        }

        [Fact]
        public void GetDoesNotExist()
        {
            ClosingRemarkService closingRemarkService = new ClosingRemarkService(fixture.context);

            Assert.Throws<NotFoundInDBException>(() => closingRemarkService.GetClosingRemark("some_closingRemark_id_that_does_not_exist"));
        }

        [Fact]
        public void GetExists()
        {
            ClosingRemarkService closingRemarkService = new ClosingRemarkService(fixture.context);
            ParticipantService participantService = new ParticipantService(fixture.context);
            Participant participant = participantService.GetAll().First();
            ActionService actionService = new ActionService(fixture.context);
            Action action = actionService.GetAll().First();

            ClosingRemark ClosingRemarkCreate = closingRemarkService.Create(participant, "text", action);

            ClosingRemark ClosingRemarkGet = closingRemarkService.GetClosingRemark(ClosingRemarkCreate.Id);

            Assert.Equal(ClosingRemarkCreate, ClosingRemarkGet);
        }
    }
}
