using System;
using SystemAction = System.Action;
using System.Linq;
using Xunit;

using api.Context;
using api.Models;
using api.Services;

namespace tests
{
    [Collection("UsesDbContext")]
    public class ParticipantServiceTest
    {
        private readonly BmtDbContext _context;
        public ParticipantServiceTest()
        {
            _context = Globals.context;
        }
        [Fact]
        public void GetQueryable()
        {
            ParticipantService participantService = new ParticipantService(_context);
            IQueryable<Participant> participantQueryable = participantService.GetAll();

            Assert.True(participantQueryable.Count() > 0);
        }

        [Fact]
        public void Create()
        {
            ParticipantService participantService = new ParticipantService(_context);

            int nParticipantsBefore = participantService.GetAll().Count();
            participantService.Create("some_id_we_got_from_fusion", ExampleEvaluation(), Organization.Engineering, Role.Participant);
            int nParticipantsAfter = participantService.GetAll().Count();

            Assert.Equal(nParticipantsBefore + 1, nParticipantsAfter);
        }

        [Fact]
        public void GetDoesNotExists()
        {
            ParticipantService participantService = new ParticipantService(_context);

            SystemAction act = () => participantService.GetParticipant("some_participant_id_that_does_not_exist");

            Assert.Throws<NotFoundInDBException>(act);
        }

        [Fact]
        public void GetExist()
        {
            ParticipantService participantService = new ParticipantService(_context);

            Participant participantCreate = participantService.Create("some_fusion_person_id", ExampleEvaluation(), Organization.Engineering, Role.Participant);

            Participant participantGet = participantService.GetParticipant(participantCreate.Id);

            Assert.Equal(participantCreate, participantGet);
        }

        private Evaluation ExampleEvaluation()
        {
            EvaluationService evaluationService = new EvaluationService(_context);
            return evaluationService.GetAll().First();
        }
    }
}
