using System.Linq;
using Xunit;

using api.Models;
using api.Services;

namespace tests
{
    [Collection("Database collection")]
    public class EvaluationServiceTest
    {
        DatabaseFixture fixture;

        public EvaluationServiceTest(DatabaseFixture fixture)
        {
            this.fixture = fixture;
        }

        private Project GetProject() {
            ProjectService projectService = new ProjectService(fixture.context);
            return projectService.GetAll().First();
        }

        [Fact]
        public void GetQueryable()
        {
            EvaluationService evaluationService = new EvaluationService(fixture.context);

            IQueryable<Evaluation> evaluationQueryable = evaluationService.GetAll();

            Assert.True(evaluationQueryable.Count() > 0);
        }

        [Fact]
        public void Create()
        {
            Project project = GetProject();
            EvaluationService evaluationService = new EvaluationService(fixture.context);

            int nEvaluationsBefore = evaluationService.GetAll().Count();
            evaluationService.Create("some_name", project, "");
            int nEvaluationsAfter = evaluationService.GetAll().Count();

            Assert.Equal(nEvaluationsBefore + 1, nEvaluationsAfter);
        }

        [Fact]
        public void ProgressEvaluation()
        {
            Project project = GetProject();

            EvaluationService evaluationService = new EvaluationService(fixture.context);
            Evaluation evaluation = evaluationService.Create("some_name", project, "");
            Progression nextEvaluation = ServiceUtil.NextProgression(evaluation.Progression);

            Progression progressionBefore = evaluation.Progression;
            evaluationService.ProgressEvaluation(evaluation, nextEvaluation);
            Progression progressionAfter = evaluation.Progression;

            Assert.True(ServiceUtil.NextProgression(progressionBefore).Equals(progressionAfter));
        }

        [Fact]
        public void GetDoesNotExist()
        {
            EvaluationService evaluationService = new EvaluationService(fixture.context);

            Assert.Throws<NotFoundInDBException>(() => evaluationService.GetEvaluation("some_evaluation_id_that_does_not_exist"));
        }

        [Fact]
        public void GetExists()
        {
            Project project = GetProject();

            EvaluationService evaluationService = new EvaluationService(fixture.context);
            Evaluation evaluationCreate = evaluationService.Create("some__name", project, "");

            Evaluation evaluationGet = evaluationService.GetEvaluation(evaluationCreate.Id);

            Assert.Equal(evaluationCreate, evaluationGet);
        }

        [Fact]
        public void SetSummary()
        {
            Project project           = GetProject();
            EvaluationService service = new EvaluationService(fixture.context);
            Evaluation evaluation     = service.Create("eval_name", project, "");

            string summary = "Summary";

            Assert.Equal("", evaluation.Summary);
            service.SetSummary(evaluation, summary);
            Assert.Equal(summary, evaluation.Summary);
        }

        [Fact]
        public void SetStatus()
        {
            Project project           = GetProject();
            EvaluationService service = new EvaluationService(fixture.context);
            Evaluation evaluation     = service.Create("eval_name", project, "");

            Status newStatus = Status.Voided;
            service.SetStatus(evaluation, newStatus);
            Assert.Equal(newStatus, evaluation.Status);
        }
        
        [Fact]
        public void SetWorkshopCompleteDate()
        {
            Project project           = GetProject();
            EvaluationService service = new EvaluationService(fixture.context);
            Evaluation evaluation     = service.Create("eval_name", project, "");
            System.DateTimeOffset testStartDate = System.DateTimeOffset.UtcNow;

            Assert.Null(evaluation.WorkshopCompleteDate);

            evaluation.Progression = Progression.Workshop;
            var exceptionProgress = Assert.Throws<System.InvalidOperationException>
                (() => service.SetWorkshopCompleteDate(evaluation));
            Assert.Contains(
                $"WorkshopCompleteDate requires an evaluation on FollowUp; it is: {evaluation.Progression}",
                exceptionProgress.Message);

            evaluation.Progression = Progression.FollowUp;
            service.SetWorkshopCompleteDate(evaluation);
            Assert.True(testStartDate < evaluation.WorkshopCompleteDate);

            var exceptionPreviouslySet = Assert.Throws<System.InvalidOperationException>
                (() => service.SetWorkshopCompleteDate(evaluation));
            Assert.Contains(
                $"Completion date already set as: {evaluation.WorkshopCompleteDate}",
                exceptionPreviouslySet.Message);
        }
    }
}
