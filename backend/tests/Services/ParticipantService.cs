using System.Linq;
using Xunit;

using api.Models;
using api.Services;
using System;

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

        [Fact]
        public void ProgressAllParticipants()
        {
            ProjectService projectService = new ProjectService(_context);
            ParticipantService participantService = new ParticipantService(_context);
            EvaluationService evaluationService = new EvaluationService(_context);
            Project project = projectService.Create("ProgressAllParticipants");
            Evaluation evaluation = evaluationService.Create("ProgressAllParticipants", project, "");
            Participant participant1 = participantService.Create("ProgressAllParticipants1", evaluation, Organization.All, Role.Facilitator);
            Participant participant2 = participantService.Create("ProgressAllParticipants2", evaluation, Organization.Commissioning, Role.OrganizationLead);

            Progression progression1Before = participant1.Progression;
            participantService.ProgressAllParticipants(evaluation, Progression.Individual);
            Progression progression1After = participant1.Progression;
            Progression progression2After = participant2.Progression;

            Assert.Equal(Progression.Nomination, progression1Before);
            Assert.Equal(Progression.Individual, progression1After);
            Assert.Equal(Progression.Individual, progression2After);
        }

        [Fact]
        public void ProgressParticipant()
        {
            ProjectService projectService = new ProjectService(_context);
            ParticipantService participantService = new ParticipantService(_context);
            EvaluationService evaluationService = new EvaluationService(_context);
            Project project = projectService.Create("ProgressParticipant");
            Evaluation evaluation = evaluationService.Create("ProgressParticipant", project, "");
            Participant participant = participantService.Create("ProgressParticipant", evaluation, Organization.All, Role.Facilitator);

            Progression progressionBefore = participant.Progression;
            participantService.ProgressParticipant(participant, Progression.Individual);
            Progression progressionAfter = participant.Progression;

            Assert.Equal(Progression.Nomination, progressionBefore);
            Assert.Equal(Progression.Individual, progressionAfter);
        }

        [Fact]
        public void ParticipantAddedToEvaluation()
        {
            EvaluationService evaluationService = new EvaluationService(_context);
            Evaluation evaluation = evaluationService.GetAll().First();
            ParticipantService participantService = new ParticipantService(_context);

            int participantsBefore = evaluation.Participants.Count;
            participantService.Create("ParticipantAddedToEvaluation_id", evaluation, Organization.Engineering, Role.Participant);
            int participantsAfter = evaluation.Participants.Count;

            Assert.Equal(participantsBefore + 1, participantsAfter);
        }

        [Fact]
        public void ParticipantAddedToProject()
        {
            ProjectService projectService = new ProjectService(_context);
            Project project = projectService.GetAll().First();
            Evaluation evaluation = project.Evaluations.First();
            ParticipantService participantService = new ParticipantService(_context);

            int participantsBefore = project.Evaluations.First().Participants.Count;
            participantService.Create("ParticipantAddedToProject", evaluation, Organization.Engineering, Role.Participant);
            int participantsAfter = project.Evaluations.First().Participants.Count;

            Assert.Equal(participantsBefore + 1, participantsAfter);
        }

        [Fact]
        public void ParticipantDeletedFromEvaluation()
        {
            EvaluationService evaluationService = new EvaluationService(_context);
            Evaluation evaluation = evaluationService.GetAll().First();
            ParticipantService participantService = new ParticipantService(_context);
            Participant participant = participantService.Create("ParticipantDeletedFromEvaluation_id", evaluation, Organization.Engineering, Role.Participant);

            int participantsBefore = evaluation.Participants.Count;
            participantService.Remove(participant.Id);
            int participantsAfter = evaluation.Participants.Count;

            Assert.Equal(participantsBefore - 1, participantsAfter);
        }

    }
}
