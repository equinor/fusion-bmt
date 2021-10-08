using api.GQL;
using api.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using System.Linq;
using Xunit;

namespace tests
{
    [Collection("Database collection")]
    public class QueryTest
    {
        private readonly GraphQuery _query;
        DatabaseFixture fixture;
        public QueryTest(DatabaseFixture fixture)
        {
            this.fixture = fixture;
            ILoggerFactory factory = new NullLoggerFactory();
            _query = new GraphQuery(
                new ProjectService(fixture.context),
                new EvaluationService(fixture.context),
                new ParticipantService(fixture.context),
                new QuestionService(fixture.context),
                new QuestionTemplateService(fixture.context),
                new AnswerService(fixture.context),
                new ActionService(fixture.context),
                new NoteService(fixture.context),
                new ClosingRemarkService(fixture.context),
                new ProjectCategoryService(fixture.context),
                new Logger<GraphQuery>(factory)
            );
        }

        [Fact]
        public void EnsureCreatedProject()
        {
            int projectsBefore = _query.GetProjects().Count();
            _query.GetProject("some_id_that_does_not_exist");
            int projectsAfter = _query.GetProjects().Count();

            Assert.Equal(projectsBefore + 1, projectsAfter);
        }

        [Fact]
        public void EnsureCreatedProjectExists()
        {
            _query.GetProject("some_id_that_does_not_exist_2");
            int projectsBefore = _query.GetProjects().Count();
            _query.GetProject("some_id_that_does_not_exist_2");
            int projectsAfter = _query.GetProjects().Count();

            Assert.Equal(projectsBefore, projectsAfter);
        }
    }
}
