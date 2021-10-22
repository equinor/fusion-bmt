using Xunit;
using System;
using System.Linq;

using api.Models;
using api.Services;
using api.GQL;


namespace tests
{
    [Collection("Database collection")]
    public class CreateParticipantMutation : MutationTest
    {
        private readonly Evaluation _evaluation;
        private readonly Participant _facilitator;
        private readonly Participant _organizationLead;
        private readonly Participant _participant;

        public CreateParticipantMutation(DatabaseFixture fixture) : base(fixture) {
            _evaluation = CreateEvaluation();
            _facilitator = _evaluation.Participants.First();
            _authService.LoginUser(_facilitator);

            _organizationLead = CreateParticipant(_evaluation, role: Role.OrganizationLead);
            _participant = CreateParticipant(_evaluation, role: Role.Participant);
        }

        /* Tests */

        [Fact]
        public void FacilitatorCanUseMutation()
        {
            AssertCanCreate(_facilitator);
        }

        [Fact]
        public void OrganizationLeadCanUseMutation()
        {
            AssertCanCreate(_organizationLead);
        }

        [Fact]
        public void ParticipantIsUnauthorized()
        {
            AssertIsNotAuthorized(_participant);
        }

        [Fact]
        public void NonParcipantIsUnauthorized()
        {
            string AzureUniqueId = Randomize.Integer().ToString();
            AssertIsNotAuthorized(AzureUniqueId);
        }

        /* Helper methods */

        private void AssertCanCreate(Participant user)
        {
            _authService.LoginUser(user);
            int participants = NumberOfParticipants(_evaluation);
            CreateParticipant(_evaluation);
            Assert.True(NumberOfParticipants(_evaluation) == participants + 1);
        }

        private void AssertIsNotAuthorized(string azureUniqueId)
        {
            _authService.LoginUser(azureUniqueId);
            Assert.Throws<UnauthorizedAccessException>(() =>
                CreateParticipant(_evaluation)
            );
        }

        private void AssertIsNotAuthorized(Participant user)
        {
            AssertIsNotAuthorized(user.AzureUniqueId);
        }
    }
}
