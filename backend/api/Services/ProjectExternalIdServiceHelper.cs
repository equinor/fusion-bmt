using System.Collections.Generic;


namespace api.Services
{
    public static class ProjectExternalIdServiceHelper
    {
        private static bool running = false;
        private static List<string> updatedProjectIds = new();
        private static int numProjectsWithoutExternalId = 0;

        public static bool GetRunning()
        {
            return running;
        }

        public static void SetRunning(bool value)
        {
            running = value;
        }

        public static List<string> GetUpdatedProjectIds()
        {
            return updatedProjectIds;
        }

        public static void SetUpdatedProjectIds(List<string> value)
        {
            updatedProjectIds = value;
        }

        public static int GetNumProjectsWithoutExternalId()
        {
            return numProjectsWithoutExternalId;
        }

        public static void SetNumProjectsWithoutExternalId(int value)
        {
            numProjectsWithoutExternalId = value;
        }
    }
}
