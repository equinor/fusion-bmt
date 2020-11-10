using api.Models;

namespace api.Services
{
    public static class ServiceUtil
    {
        public static Progression NextProgression(Progression? currentProgression) =>
            currentProgression switch
            {
                Progression.Nomination => Progression.Preparation,
                Progression.Preparation => Progression.Alignment,
                Progression.Alignment => Progression.Workshop,
                Progression.Workshop => Progression.FollowUp,
                _ => throw new ProgressionTransitionException("Invalid progression"),
            };
    }
}
