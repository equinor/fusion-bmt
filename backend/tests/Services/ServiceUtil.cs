using Xunit;

using api.Models;
using api.Services;

namespace tests
{
    public class ServiceUtilTest
    {
        [Fact]
        public void NextProgression()
        {
            Assert.True(ServiceUtil.NextProgression(Progression.Nomination).Equals(Progression.IndividualAssessment));
            Assert.True(ServiceUtil.NextProgression(Progression.IndividualAssessment).Equals(Progression.Alignment));
            Assert.True(ServiceUtil.NextProgression(Progression.Alignment).Equals(Progression.Workshop));
            Assert.True(ServiceUtil.NextProgression(Progression.Workshop).Equals(Progression.FollowUp));

            Assert.Throws<ProgressionTransitionException>(() => ServiceUtil.NextProgression(Progression.FollowUp));
        }
    }
}
