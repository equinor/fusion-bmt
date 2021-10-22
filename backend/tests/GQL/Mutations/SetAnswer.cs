using Xunit;
using System;
using System.Linq;

using api.Models;
using api.Services;
using api.GQL;


namespace tests
{
    [Collection("Database collection")]
    public class SetAnswerMutation : MutationTest
    {
        private readonly Evaluation _evaluation;
        private readonly Participant _facilitator;
        private readonly Participant _organizationLead;
        private readonly Participant _participant;
        private readonly Question _question;

        public SetAnswerMutation(DatabaseFixture fixture) : base(fixture) {
            _evaluation = CreateEvaluation();
            _facilitator = _evaluation.Participants.First();
            _authService.LoginUser(_facilitator);

            _organizationLead = CreateParticipant(_evaluation, role: Role.OrganizationLead);
            _participant = CreateParticipant(_evaluation, role: Role.Participant);
            _question = GetFirstQuestion(_evaluation);
        }

        /* Tests */

        [Fact]
        public void FacilitatorCanUseMutation()
        {
            AssertCanSet(_facilitator);
        }

        [Fact]
        public void OrganizationLeadCanUseMutation()
        {
            AssertCanSet(_organizationLead);
        }

        [Fact]
        public void ParticipantCanUseMutation()
        {
            AssertCanSet(_participant);
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
            int answers = NumberOfAnswers(_question);
            SetAnswer(_question.Id);
            Assert.True(NumberOfAnswers(_question) == answers + 1);
        }

        private void AssertIsNotAuthorized(string azureUniqueId)
        {
            _authService.LoginUser(azureUniqueId);
            Assert.Throws<UnauthorizedAccessException>(() =>
                SetAnswer(_question.Id)
            );
        }

        private void AssertIsNotAuthorized(Participant user)
        {
            AssertIsNotAuthorized(user.AzureUniqueId);
        }
    }
}
