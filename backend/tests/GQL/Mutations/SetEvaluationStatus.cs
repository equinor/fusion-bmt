using Xunit;
using System;
using System.Linq;

using api.Models;

namespace tests
{
    [Collection("Database collection")]
    public class SetEvaluationStatusMutation: MutationTest
    {
        private readonly Evaluation _evaluation;
        private readonly Participant _facilitator;
        private readonly Participant _organizationLead;
        private readonly Participant _participant;

        public SetEvaluationStatusMutation(DatabaseFixture fixture) : base(fixture) {
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
        public void NonParcipantIsUnauthorized()
        {
            string AzureUniqueId = Randomize.Integer().ToString();
            AssertIsNotAuthorized(AzureUniqueId);
        }

        /* Helper methods */

        private void AssertCanSet(Participant user)
        {
            _authService.LoginUser(user);

            Status status = Randomize.Status();
            _mutation.SetEvaluationStatus(
                evaluationId: _evaluation.Id,
                newStatus: status
            );

            Assert.True(_evaluation.Status == status);
        }

        private void AssertIsNotAuthorized(string azureUniqueId)
        {
            _authService.LoginUser(azureUniqueId);
            Assert.Throws<UnauthorizedAccessException>(() =>
                _mutation.SetEvaluationStatus(
                    evaluationId: _evaluation.Id,
                    newStatus: Randomize.Status()
                )
            );
        }

        private void AssertIsNotAuthorized(Participant user)
        {
            AssertIsNotAuthorized(user.AzureUniqueId);
        }
    }
}
