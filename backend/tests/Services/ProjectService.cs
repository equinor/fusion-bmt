using System.Linq;
using Xunit;

using api.Models;
using api.Services;

namespace tests
{
    [Collection("UsesDbContext")]
    public class ProjectServiceTest : DbContextTestSetup
    {
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
        public void GetProjectFromFusionIdException()
        {
            ProjectService projectService = new ProjectService(_context);

            Assert.Throws<NotFoundInDBException>(() => projectService.GetProjectFromFusionId("some_project_id_that_does_not_exist"));
        }

        [Fact]
        public void GetProjectFromFusionId()
        {
            ProjectService projectService = new ProjectService(_context);

            Project projectExsists = projectService.GetAll().First();

            Project projectGotten = projectService.GetProjectFromFusionId(projectExsists.FusionProjectId);

            Assert.Equal(projectExsists, projectGotten);
        }

        [Fact]
        public void GetDoesNotExist()
        {
            ProjectService projectService = new ProjectService(_context);

            Assert.Throws<NotFoundInDBException>(() => projectService.GetProject("some_project_id_that_does_not_exist"));
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
