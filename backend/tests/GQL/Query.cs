using api.GQL;
using api.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using System.Linq;
using Xunit;

namespace tests
{
    [Collection("UsesDbContext")]
    public class QueryTest : DbContextTestSetup
    {
        private readonly GraphQuery _query;
        public QueryTest()
        {
            ILoggerFactory factory = new NullLoggerFactory();
            _query = new GraphQuery(
                new ProjectService(_context),
                new EvaluationService(_context),
                new ParticipantService(_context),
                new QuestionService(_context),
                new AnswerService(_context),
                new ActionService(_context),
                new NoteService(_context),
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
