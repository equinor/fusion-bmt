using Xunit;
using System;
using System.Linq;

using api.Models;
using api.Services;
using api.GQL;


namespace tests
{
    public class CreateNoteMutation : MutationTest
    {
        private readonly Evaluation _evaluation;
        private readonly Participant _facilitator;
        private readonly Participant _organizationLead;
        private readonly Participant _participant;
        private readonly Participant _readonly;
        private readonly Question _question;
        private readonly api.Models.Action _action;

        public CreateNoteMutation() {
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
            AssertCanCreate(_facilitator);
        }

        [Fact]
        public void OrganizationLeadCanUseMutation()
        {
            AssertCanCreate(_organizationLead);
        }

        [Fact]
        public void ParticipantCanUseMutation()
        {
            AssertCanCreate(_participant);
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

        private void AssertCanCreate(Participant user)
        {
            _authService.LoginUser(user);
            int notes = NumberOfNotes(_action);
            CreateNote(
                actionId: _action.Id,
                text: Randomize.String()
            );
            Assert.True(NumberOfNotes(_action) == notes + 1);
        }

        private void AssertIsNotAuthorized(string azureUniqueId)
        {
            _authService.LoginUser(azureUniqueId);
            Assert.Throws<UnauthorizedAccessException>(() =>
                CreateNote(
                    actionId: _action.Id,
                    text: Randomize.String()
                )
            );
        }
    }
}
