using System.Linq;
using Xunit;

using api.Context;
using api.Models;
using api.Services;

namespace tests
{
    public class ProjectServiceTest
    {
        private BmtDbContext _context;

        public ProjectServiceTest()
        {
            _context = new BmtDbContext();
        }

        [Fact]
        public void GetQueryable()
        {
            ProjectService projectService = new ProjectService(_context);

            IQueryable<Project> projectQueryable = projectService.GetAll();

            Assert.True(projectQueryable.Count() > 0);
        }

        [Fact]
        public async void Create()
        {
            ProjectService projectService = new ProjectService(_context);

            int nProjectsBefore = projectService.GetAll().Count();
            Project project = await projectService.Create("2");
            int nProjectsAfter = projectService.GetAll().Count();

            Assert.Equal(nProjectsBefore+1, nProjectsAfter);
        }
    }
}
