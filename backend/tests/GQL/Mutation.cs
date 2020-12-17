using api.GQL;
using api.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using System.Linq;
using Xunit;

namespace tests
{
    [Collection("UsesDbContext")]
    public class MutationTest : DbContextTestSetup
    {
        private readonly Mutation _mutation;
        public MutationTest()
        {
            ILoggerFactory factory = new NullLoggerFactory();
            _mutation = new Mutation(
                new ProjectService(_context),
                new EvaluationService(_context),
                new ParticipantService(_context),
                new QuestionService(_context),
                new AnswerService(_context),
                new QuestionTemplateService(_context),
                new ActionService(_context),
                new NoteService(_context),
                new MockAuthService(),
                new Logger<Mutation>(factory)
            );
        }

        [Fact]
        public void CreateEvaluation()
        {
            string projectId = _context.Projects.First().Id;
            int evaluationsBefore = _context.Evaluations.Count();
            _mutation.CreateEvaluation("CreateEvaluation", projectId);
            int evaluationsAfter = _context.Evaluations.Count();

            Assert.Equal(evaluationsBefore + 1, evaluationsAfter);
        }
    }
}
