using SystemAction = System.Action;
using System.Linq;
using Xunit;

using api.Context;
using api.Models;
using api.Services;

namespace tests
{
    [Collection("UsesDbContext")]
    public class ProjectServiceTest
    {
        private readonly BmtDbContext _context;
        public ProjectServiceTest()
        {
            _context = Globals.context;
        }

        [Fact]
        public void GetQueryable()
        {
            ProjectService projectService = new ProjectService(_context);
            IQueryable<Project> projectQueryable = projectService.GetAll();

            Assert.True(projectQueryable.Count() > 0);
        }

        [Fact]
        public void Create()
        {
            ProjectService projectService = new ProjectService(_context);
            int nProjectsBefore = projectService.GetAll().Count();
            projectService.Create("some_id_that_does_not_exist");
            int nProjectsAfter = projectService.GetAll().Count();

            Assert.Equal(nProjectsBefore + 1, nProjectsAfter);
        }

        [Fact]
        public void EnsureCreatedMightExist()
        {
            ProjectService projectService = new ProjectService(_context);

            projectService.EnsureCreated("some_id_that_might_exist");
            int nProjectsBefore = projectService.GetAll().Count();
            projectService.EnsureCreated("some_id_that_might_exist");
            int nProjectsAfter = projectService.GetAll().Count();

            Assert.Equal(nProjectsBefore, nProjectsAfter);
        }

        [Fact]
        public void EnsureCreatedDoesNotExist()
        {
            ProjectService projectService = new ProjectService(_context);

            int nProjectsBefore = projectService.GetAll().Count();
            projectService.EnsureCreated("some_id_that_definitely_does_not_exist");
            int nProjectsAfter = projectService.GetAll().Count();

            Assert.Equal(nProjectsBefore + 1, nProjectsAfter);
        }

        [Fact]
        public void GetDoesNotExist()
        {
            ProjectService projectService = new ProjectService(_context);

            SystemAction act = () => projectService.GetProject("some_project_id_that_does_not_exist");

            Assert.Throws<NotFoundInDBException>(act);
        }

        [Fact]
        public void GetExists()
        {
            ProjectService projectService = new ProjectService(_context);

            Project projectCreate = projectService.Create("some_fusion_project_id");

            Project projectGet = projectService.GetProject(projectCreate.Id);

            Assert.Equal(projectCreate, projectGet);
        }
    }
}
