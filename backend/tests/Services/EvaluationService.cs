using SystemAction = System.Action;
using System.Linq;
using Xunit;

using api.Context;
using api.Models;
using api.Services;

namespace tests
{
    [Collection("UsesDbContext")]
    public class EvaluationServiceTest
    {
        private readonly BmtDbContext _context;
        public EvaluationServiceTest()
        {
            _context = Globals.context;
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
            EvaluationService evaluationService = new EvaluationService(_context);

            int nEvaluationsBefore = evaluationService.GetAll().Count();
            evaluationService.Create("some_name", ExampleProject());
            int nEvaluationsAfter = evaluationService.GetAll().Count();

            Assert.Equal(nEvaluationsBefore + 1, nEvaluationsAfter);
        }

        [Fact]
        public void ProgressEvaluation()
        {
            EvaluationService evaluationService = new EvaluationService(_context);
            Evaluation evaluation = evaluationService.Create("some_name", ExampleProject());

            Progression progressionBefore = evaluation.Progression;
            evaluationService.ProgressEvaluation(evaluation.Id);
            Progression progressionAfter = evaluation.Progression;

            Assert.True(ServiceUtil.NextProgression(progressionBefore).Equals(progressionAfter));
        }

        [Fact]
        public void GetDoesNotExist()
        {
            EvaluationService evaluationService = new EvaluationService(_context);

            SystemAction act = () => evaluationService.GetEvaluation("some_evaluation_id_that_does_not_exist");

            Assert.Throws<NotFoundInDBException>(act);
        }

        [Fact]
        public void GetExists()
        {
            EvaluationService evaluationService = new EvaluationService(_context);

            Evaluation evaluationCreate = evaluationService.Create("some_evaluation_name", ExampleProject());

            Evaluation evaluationGet = evaluationService.GetEvaluation(evaluationCreate.Id);

            Assert.Equal(evaluationCreate, evaluationGet);
        }

        private Project ExampleProject()
        {
            ProjectService projectService = new ProjectService(_context);
            return projectService.GetAll().First();
        }
    }
}
