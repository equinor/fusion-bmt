using Xunit;
using System;
using System.Linq;

using api.Models;
using api.Services;
using api.GQL;


namespace tests
{
    public class ProgressParticipantMutation : MutationTest
    {
        private readonly Evaluation _evaluation;
        private readonly Participant _facilitator;
        private readonly Participant _organizationLead;
        private readonly Participant _participant;
        private readonly Participant _readonly;

        public ProgressParticipantMutation() {
            _evaluation = CreateEvaluation();
            _facilitator = _evaluation.Participants.First();
            _authService.LoginUser(_facilitator);

            _organizationLead = CreateParticipant(_evaluation, role: Role.OrganizationLead);
            _participant = CreateParticipant(_evaluation, role: Role.Participant);
            _readonly = CreateParticipant(_evaluation, role: Role.ReadOnly);
        }

        /* Tests */

        [Fact]
        public void FacilitatorCanUseMutation()
        {
            AssertCanProgress(_facilitator);
        }

        [Fact]
        public void OrganizationLeadCanUseMutation()
        {
            AssertCanProgress(_organizationLead);
        }

        [Fact]
        public void ParticipantCanUseMutation()
        {
            AssertCanProgress(_participant);
        }

        [Fact]
        public void ReadOnlyIsUnauthorized()
        {
            AssertIsNotAuthorized(_readonly);
        }

        /* Helper methods */

        private void AssertCanProgress(Participant user)
        {
            _authService.LoginUser(user);
            Progression newProgression = Randomize.Progression();

            _mutation.ProgressParticipant(
                evaluationId: _evaluation.Id,
                newProgression: newProgression
            );

            Assert.True(user.Progression == newProgression);
        }

        private void AssertIsNotAuthorized(Participant user)
        {
            _authService.LoginUser(user.AzureUniqueId);
            Assert.Throws<UnauthorizedAccessException>(() =>
                _mutation.ProgressParticipant(
                    evaluationId: _evaluation.Id,
                    newProgression: Randomize.Progression()
                )
            );
        }
    }
}
