using Xunit;
using System;
using System.Linq;

using api.Models;
using api.Services;
using api.GQL;


namespace tests
{
    [Collection("Database collection")]
    public class SetSummaryMutation: MutationTest
    {
        private readonly Evaluation _evaluation;
        private readonly Participant _facilitator;
        private readonly Participant _organizationLead;
        private readonly Participant _participant;
        private readonly Participant _readonly;

        public SetSummaryMutation(DatabaseFixture fixture) : base(fixture) {
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
            AssertCanSet(_facilitator);
        }

        [Fact]
        public void OrganizationLeadIsUnauthorized()
        {
            AssertIsNotAuthorized(_organizationLead);
        }

        [Fact]
        public void ParticipantIsUnauthorized()
        {
            AssertIsNotAuthorized(_participant);
        }

        [Fact]
        public void ReadOnlyIsUnauthorized()
        {
            AssertIsNotAuthorized(_readonly);
        }

        [Fact]
        public void NonParcipantIsUnauthorized()
        {
            string AzureUniqueId = Randomize.Integer().ToString();
            AssertIsNotAuthorized(AzureUniqueId);
        }

        /* Helper methods */

        private void AssertCanSet(Participant user)
        {
            _authService.LoginUser(user);

            string summary = Randomize.String();
            _mutation.SetSummary(
                evaluationId: _evaluation.Id,
                summary: summary
            );

            Assert.True(_evaluation.Summary == summary);
        }

        private void AssertIsNotAuthorized(string azureUniqueId)
        {
            _authService.LoginUser(azureUniqueId);
            Assert.Throws<UnauthorizedAccessException>(() =>
                _mutation.SetSummary(
                    evaluationId: _evaluation.Id,
                    summary: Randomize.String()
                )
            );
        }

        private void AssertIsNotAuthorized(Participant user)
        {
            AssertIsNotAuthorized(user.AzureUniqueId);
        }
    }
}
