using System;
using System.Collections.Generic;
using System.Linq;
using Xunit;

using api.Context;
using api.Services;
using api.Models;

namespace tests
{
    [Collection("UsesDbContext")]
    public class DbContextTests
    {
        private readonly BmtDbContext _context;
        public DbContextTests()
        {
            _context = Globals.context;
        }

        [Fact]
        public void InitQuestions()
        {
            List<Question> questions = InitContent.Questions;

            Assert.Equal(11, questions.Count());
        }


        [Fact]
        public void ParticipantAddedToEvaluation()
        {
            EvaluationService evaluationService = new EvaluationService(_context);
            Evaluation exampleEvaluation = evaluationService.GetAll().First();
            ParticipantService participantService = new ParticipantService(_context);

            int participantsBefore = exampleEvaluation.Participants.Count;
            participantService.Create("some_id_we_got_from_fusion", exampleEvaluation, Organization.Engineering, Role.Participant);
            int participantsAfter = exampleEvaluation.Participants.Count;

            Assert.Equal(participantsBefore + 1, participantsAfter);
        }

        [Fact]
        public void ParticipantAddedToProject()
        {
            ProjectService projectService = new ProjectService(_context);
            Project exampleProject = projectService.GetAll().First();
            Evaluation exampleEvaluation = exampleProject.Evaluations.First();
            ParticipantService participantService = new ParticipantService(_context);

            int participantsBefore = exampleProject.Evaluations.First().Participants.Count;
            participantService.Create("some_id_we_got_from_fusion", exampleEvaluation, Organization.Engineering, Role.Participant);
            int participantsAfter = exampleProject.Evaluations.First().Participants.Count;

            Assert.Equal(participantsBefore + 1, participantsAfter);
        }

        [Fact]
        public void ParticipantDeletedFromEvaluation()
        {
            EvaluationService evaluationService = new EvaluationService(_context);
            Evaluation exampleEvaluation = evaluationService.GetAll().First();
            ParticipantService participantService = new ParticipantService(_context);
            Participant exampleParticipant = exampleEvaluation.Participants.First();

            int participantsBefore = exampleEvaluation.Participants.Count;
            participantService.Remove(exampleParticipant.Id);
            int participantsAfter = exampleEvaluation.Participants.Count;

            Assert.Equal(participantsBefore - 1, participantsAfter);
        }
    }
}
