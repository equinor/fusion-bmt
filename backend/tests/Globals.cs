using api.Context;

namespace tests
{
    public static class Globals
    {
        public static readonly BmtDbContext context = GetDbContext();

        private static BmtDbContext GetDbContext()
        {
            BmtDbContext context = new BmtDbContext();
            context.InitializeIfInMem();
            return context;
        }
    }
}
