using System.Linq;
using Xunit;

using api.Models;
using api.Services;

namespace tests
{
    [Collection("UsesDbContext")]
    public class EvaluationServiceTest : DbContextTestSetup
    {

        private Project GetProject() {
            ProjectService projectService = new ProjectService(_context);
            return projectService.GetAll().First();
        }

        [Fact]
        public void GetQueryable()
        {
            EvaluationService evaluationService = new EvaluationService(_context);

            IQueryable<Evaluation> evaluationQueryable = evaluationService.GetAll();

            Assert.True(evaluationQueryable.Count() > 0);
        }

        [Fact]
        public void Create()
        {
            Project project = GetProject();
            EvaluationService evaluationService = new EvaluationService(_context);

            int nEvaluationsBefore = evaluationService.GetAll().Count();
            evaluationService.Create("some_name", project);
            int nEvaluationsAfter = evaluationService.GetAll().Count();

            Assert.Equal(nEvaluationsBefore + 1, nEvaluationsAfter);
        }

        [Fact]
        public void ProgressEvaluation()
        {
            Project project = GetProject();

            EvaluationService evaluationService = new EvaluationService(_context);
            Evaluation evaluation = evaluationService.Create("some_name", project);
            Progression nextEvaluation = ServiceUtil.NextProgression(evaluation.Progression);

            Progression progressionBefore = evaluation.Progression;
            evaluationService.ProgressEvaluation(evaluation, nextEvaluation);
            Progression progressionAfter = evaluation.Progression;

            Assert.True(ServiceUtil.NextProgression(progressionBefore).Equals(progressionAfter));
        }

        [Fact]
        public void GetDoesNotExist()
        {
            EvaluationService evaluationService = new EvaluationService(_context);

            Assert.Throws<NotFoundInDBException>(() => evaluationService.GetEvaluation("some_evaluation_id_that_does_not_exist"));
        }

        [Fact]
        public void GetExists()
        {
            Project project = GetProject();

            EvaluationService evaluationService = new EvaluationService(_context);
            Evaluation evaluationCreate = evaluationService.Create("some_evaluation_name", project);

            Evaluation evaluationGet = evaluationService.GetEvaluation(evaluationCreate.Id);

            Assert.Equal(evaluationCreate, evaluationGet);
        }

        [Fact]
        public void SetSummary()
        {
            Project project           = GetProject();
            EvaluationService service = new EvaluationService(_context);
            Evaluation evaluation     = service.Create("eval_name", project);

            string summary = "Summary";

            Assert.Equal("", evaluation.Summary);
            service.SetSummary(evaluation, summary);
            Assert.Equal(summary, evaluation.Summary);
        }
    }
}
