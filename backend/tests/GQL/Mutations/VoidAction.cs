using Xunit;
using System;
using System.Linq;

using api.Models;
using api.Services;
using api.GQL;


namespace tests
{
    [Collection("Database collection")]
    public class VoidActionMutation : MutationTest
    {
        private readonly Evaluation _evaluation;
        private readonly Participant _facilitator;
        private readonly Participant _organizationLead;
        private readonly Participant _participant;
        private readonly Participant _readonly;
        private readonly Question _question;
        private readonly api.Models.Action _action;

        public VoidActionMutation(DatabaseFixture fixture) : base(fixture) {
            _evaluation = CreateEvaluation();
            _facilitator = _evaluation.Participants.First();
            _authService.LoginUser(_facilitator);

            _organizationLead = CreateParticipant(_evaluation, role: Role.OrganizationLead);
            _participant = CreateParticipant(_evaluation, role: Role.Participant);
            _readonly = CreateParticipant(_evaluation, role: Role.ReadOnly);
            _question = GetFirstQuestion(_evaluation);
            _action = CreateAction(
                questionId: _question.Id,
                assignedToId: Randomize.Value<Participant>(_evaluation.Participants).Id
            );
        }

        /* Tests */

        [Fact]
        public void FacilitatorCanUseMutation()
        {
            AssertCanVoid(_facilitator);
        }

        [Fact]
        public void OrganizationLeadIsUnauthorized()
        {
            AssertIsNotAuthorized(_organizationLead.AzureUniqueId);
        }

        [Fact]
        public void ParticipantIsUnauthorized()
        {
            AssertIsNotAuthorized(_participant.AzureUniqueId);
        }

        [Fact]
        public void ReadOnlyIsUnauthorized()
        {
            AssertIsNotAuthorized(_readonly.AzureUniqueId);
        }

        [Fact]
        public void NonParcipantIsUnauthorized()
        {
            string AzureUniqueId = Randomize.Integer().ToString();
            AssertIsNotAuthorized(AzureUniqueId);
        }

        /* Helper methods */

        private void AssertCanVoid(Participant user)
        {
            var toDelete = CreateAction(
                questionId: _question.Id,
                assignedToId: Randomize.Value<Participant>(_evaluation.Participants).Id
            );

            _authService.LoginUser(user);
            int answers = NumberOfActions(_question);
            VoidAction(toDelete.Id);
            Assert.True(NumberOfActions(_question) == answers);
            Assert.True(toDelete.IsVoided);
        }

        private void AssertIsNotAuthorized(string azureUniqueId)
        {
            _authService.LoginUser(azureUniqueId);
            Assert.Throws<UnauthorizedAccessException>(() =>
                VoidAction(_action.Id)
            );
        }
    }
}
