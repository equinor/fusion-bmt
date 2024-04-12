using System.Linq;
using Xunit;

using api.Models;
using api.Services;

namespace tests
{
    [Collection("Database collection")]
    public class ProjectServiceTest
    {
        DatabaseFixture fixture;

        public ProjectServiceTest(DatabaseFixture fixture)
        {
            this.fixture = fixture;
        }
        [Fact]
        public void GetQueryable()
        {
            ProjectService projectService = new ProjectService(fixture.context);
            IQueryable<Project> projectQueryable = projectService.GetAll();

            Assert.True(projectQueryable.Count() > 0);
        }

        [Fact]
        public void Create()
        {
            ProjectService projectService = new ProjectService(fixture.context);
            int nProjectsBefore = projectService.GetAll().Count();
            projectService.Create("some_id_that_does_not_exist", "FusionProjectId");
            int nProjectsAfter = projectService.GetAll().Count();

            Assert.Equal(nProjectsBefore + 1, nProjectsAfter);
        }

        [Fact]
        public void GetProjectFromFusionIdException()
        {
            ProjectService projectService = new ProjectService(fixture.context);

            Assert.Throws<NotFoundInDBException>(() => projectService.GetProjectFromFusionId("some_project_id_that_does_not_exist"));
        }

        [Fact]
        public void GetProjectFromFusionId()
        {
            ProjectService projectService = new ProjectService(fixture.context);

            Project projectExsists = projectService.GetAll().First();

            Project projectGotten = projectService.GetProjectFromFusionId(projectExsists.FusionProjectId);

            Assert.Equal(projectExsists, projectGotten);
        }

        [Fact]
        public void GetDoesNotExist()
        {
            ProjectService projectService = new ProjectService(fixture.context);

            Assert.Throws<NotFoundInDBException>(() => projectService.GetProject("some_project_id_that_does_not_exist"));
        }

        [Fact]
        public void GetExists()
        {
            ProjectService projectService = new ProjectService(fixture.context);

            Project projectCreate = projectService.Create("some_fusion_project_id", "FusionProjectId");

            Project projectGet = projectService.GetProject(projectCreate.Id);

            Assert.Equal(projectCreate, projectGet);
        }
    }
}
