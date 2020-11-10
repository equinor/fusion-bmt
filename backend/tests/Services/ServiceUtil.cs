using SystemAction = System.Action;
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
            Assert.True(ServiceUtil.NextProgression(Progression.Nomination).Equals(Progression.Preparation));
            Assert.True(ServiceUtil.NextProgression(Progression.Preparation).Equals(Progression.Alignment));
            Assert.True(ServiceUtil.NextProgression(Progression.Alignment).Equals(Progression.Workshop));
            Assert.True(ServiceUtil.NextProgression(Progression.Workshop).Equals(Progression.FollowUp));

            SystemAction act = () => ServiceUtil.NextProgression(Progression.FollowUp);

            Assert.Throws<ProgressionTransitionException>(act);
        }
    }
}
