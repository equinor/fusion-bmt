using System.Linq;
using Xunit;

using api.Models;
using api.Services;

namespace tests
{
    [Collection("UsesDbContext")]
    public class ParticipantServiceTest : DbContextTestSetup
    {
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
            EvaluationService evaluationService = new EvaluationService(_context);
            Evaluation evaluation = evaluationService.GetAll().First();

            ParticipantService participantService = new ParticipantService(_context);

            int nParticipantsBefore = participantService.GetAll().Count();
            participantService.Create("Create_id", evaluation, Organization.Engineering, Role.Participant);
            int nParticipantsAfter = participantService.GetAll().Count();

            Assert.Equal(nParticipantsBefore + 1, nParticipantsAfter);
        }

        [Fact]
        public void CreateGetsCorrectEvaluationId()
        {
            ParticipantService participantService = new ParticipantService(_context);
            EvaluationService evaluationService = new EvaluationService(_context);
            Evaluation evaluation = evaluationService.GetAll().First();

            string evaluationIdBefore = evaluation.Id;
            Participant participant = participantService.Create("CreateGetsCorrectEvaluationId_id", evaluation, Organization.Engineering, Role.Participant);
            string evaluationIdAfter = participant.Evaluation.Id;

            Assert.Equal(evaluationIdBefore, evaluationIdAfter);
        }

        [Fact]
        public void GetDoesNotExists()
        {
            ParticipantService participantService = new ParticipantService(_context);

            Assert.Throws<NotFoundInDBException>(() => participantService.GetParticipant("some_participant_id_that_does_not_exist"));
        }

        [Fact]
        public void GetExist()
        {
            EvaluationService evaluationService = new EvaluationService(_context);
            Evaluation evaluation = evaluationService.GetAll().First();

            ParticipantService participantService = new ParticipantService(_context);
            Participant participantCreate = participantService.Create("GetExist_id", evaluation, Organization.Engineering, Role.Participant);

            Participant participantGet = participantService.GetParticipant(participantCreate.Id);

            Assert.Equal(participantCreate, participantGet);
        }

        [Fact]
        public void GetAzureId()
        {
            EvaluationService evaluationService = new EvaluationService(_context);
            Evaluation evaluation = evaluationService.GetAll().First();

            ParticipantService participantService = new ParticipantService(_context);
            string azureUniqueId = "GetAzureId_id";
            Participant participantCreated = participantService.Create(azureUniqueId, evaluation, Organization.Engineering, Role.Participant);

            Participant participantGet = participantService.GetParticipant(azureUniqueId, evaluation);

            Assert.Equal(participantCreated, participantGet);
        }

        [Fact]
        public void GetAzureIdNotExists()
        {
            EvaluationService evaluationService = new EvaluationService(_context);
            Evaluation evaluation = evaluationService.GetAll().First();

            ParticipantService participantService = new ParticipantService(_context);
            string azureUniqueId = "get_azure_unique_id_not_exists";

            Assert.Throws<NotFoundInDBException>(() => participantService.GetParticipant(azureUniqueId, evaluation));
        }

        [Fact]
        public void Delete()
        {
            EvaluationService evaluationService = new EvaluationService(_context);
            Evaluation evaluation = evaluationService.GetAll().First();

            ParticipantService participantService = new ParticipantService(_context);

            Participant participantCreate = participantService.Create("Delete_id", evaluation, Organization.Engineering, Role.Participant);

            participantService.Remove(participantCreate.Id);

            Assert.Throws<NotFoundInDBException>(() => participantService.GetParticipant(participantCreate.Id));
        }
    }
}
