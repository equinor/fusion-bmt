using Xunit;
using System;
using System.Linq;

using api.Models;
using api.Services;
using api.GQL;


namespace tests
{
    public class CreateEvaluationMutation : MutationTest
    {
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
    }
}
