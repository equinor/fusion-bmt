using Xunit;
using System;
using System.Linq;

using api.Models;
using api.Services;
using api.GQL;


namespace tests
{
    public class EditActionMutation : MutationTest
    {
        private readonly Evaluation _evaluation;
        private readonly Participant _facilitator;
        private readonly Participant _organizationLead;
        private readonly Participant _participant;
        private readonly Participant _readonly;
        private readonly Question _question;
        private readonly api.Models.Action _action;

        public EditActionMutation() {
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
            AssertCanEdit(_facilitator);
        }

        [Fact]
        public void OrganizationLeadCanUseMutation()
        {
            AssertCanEdit(_organizationLead);
        }

        [Fact]
        public void ParticipantIsCanUseMutation()
        {
            AssertCanEdit(_participant);
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

        private void AssertCanEdit(Participant user)
        {
            _authService.LoginUser(user);
            int answers = NumberOfActions(_question);
            string description = _action.Description;
            string actionId = _action.Id;

            var action = EditAction(
                actionId: actionId,
                assignedToId: Randomize.Value<Participant>(_evaluation.Participants).Id,
                description: Randomize.String()
            );
            Assert.True(NumberOfActions(_question) == answers);
            Assert.True(actionId == action.Id);
            Assert.False(description == action.Description);
        }

        private void AssertIsNotAuthorized(string azureUniqueId)
        {
            _authService.LoginUser(azureUniqueId);
            Assert.Throws<UnauthorizedAccessException>(() =>
                EditAction(
                    actionId: _action.Id,
                    assignedToId: Randomize.Value<Participant>(_evaluation.Participants).Id
                )
            );
        }
    }
}
