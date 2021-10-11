using Xunit;
using System;
using System.Linq;

using api.Models;
using api.Services;
using api.GQL;


namespace tests
{
    [Collection("Database collection")]
    public class CreateEvaluationMutation : MutationTest
    {
        public CreateEvaluationMutation(DatabaseFixture fixture) : base(fixture) {

        }
        /* Tests */
        [Fact]
        public void CreateAddsCorrectQuestions()
        {
            var projectCategory = _projectCategoryService
                .GetAll()
                .First()
            ;

            var nActiveTemplates = projectCategory.QuestionTemplates
                .Where(x => x.Status.Equals(Status.Active))
                .Count()
            ;

            var evaluation = _mutation.CreateEvaluation(
                name: Randomize.String(),
                projectId: _projectService.GetAll().First().Id,
                previousEvaluationId: "",
                projectCategoryId: projectCategory.Id
            );

            Assert.Equal(evaluation.Questions.Count(), nActiveTemplates);
        }

        [Fact]
        public void QuestionsHaveCorrectOrder()
        {
            var projectCategory = _projectCategoryService
                .GetAll()
                .Where(pc => pc.Name == "SquareField")
                .First()
            ;

            var evaluation = _mutation.CreateEvaluation(
                name: Randomize.String(),
                projectId: _projectService.GetAll().First().Id,
                previousEvaluationId: "",
                projectCategoryId: projectCategory.Id
            );

            var createdEvaluation = _evaluationService.GetEvaluation(evaluation.Id);
            int maxQuestionOrder = createdEvaluation.Questions.Max(q => q.Order);
            var firstQuestion = createdEvaluation.Questions.OrderBy(q => q.Order).First();

            Assert.Equal(1, firstQuestion.Order);
            Assert.Equal(createdEvaluation.Questions.Count(), maxQuestionOrder);
        }
    }
}
