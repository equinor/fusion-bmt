using System.Collections.Generic;
using System.Linq;
using Xunit;

using api.Models;
using api.Services;

namespace tests
{
    [Collection("Database collection")]
    public class QuestionServiceTest
    {
        DatabaseFixture fixture;

        public QuestionServiceTest(DatabaseFixture fixture)
        {
            this.fixture = fixture;
        }
        [Fact]
        public void GetQueryable()
        {
            QuestionService questionService = new QuestionService(fixture.context);

            IQueryable<Question> questionQueryable = questionService.GetAll();

            Assert.True(questionQueryable.Count() > 0);
        }

        [Fact]
        public void Create()
        {
            QuestionTemplateService questionTemplateService = new QuestionTemplateService(fixture.context);
            QuestionTemplate questionTemplate = questionTemplateService.GetAll().First();

            ProjectService projectService = new ProjectService(fixture.context);
            Project project = projectService.Create("QuestionService_Create");
            EvaluationService evaluationService = new EvaluationService(fixture.context);
            Evaluation evaluation = evaluationService.Create("QuestionService_Create", project, "");

            QuestionService questionService = new QuestionService(fixture.context);

            int nQuestionBefore = questionService.GetAll().Count();
            questionService.Create(questionTemplate, evaluation);
            int nQuestionsAfter = questionService.GetAll().Count();

            Assert.Equal(nQuestionBefore + 1, nQuestionsAfter);
        }

        [Fact]
        public void CreateBulk()
        {
            QuestionTemplateService questionTemplateService = new QuestionTemplateService(fixture.context);
            List<QuestionTemplate> questionTemplates = questionTemplateService.GetAll().ToList();

            ProjectService projectService = new ProjectService(fixture.context);
            Project project = projectService.Create("QuestionService_CreateBulk");
            EvaluationService evaluationService = new EvaluationService(fixture.context);
            Evaluation evaluation = evaluationService.Create("QuestionService_CreateBulk", project, "");

            QuestionService questionService = new QuestionService(fixture.context);

            int nQuestionBefore = questionService.GetAll().Count();
            questionService.CreateBulk(questionTemplates, evaluation);
            int nQuestionsAfter = questionService.GetAll().Count();

            Assert.Equal(nQuestionBefore + 15, nQuestionsAfter);
        }

        [Fact]
        public void GetDoesNotExist()
        {
            QuestionService questionService = new QuestionService(fixture.context);

            Assert.Throws<NotFoundInDBException>(() => questionService.GetQuestion("some_question_id_that_does_not_exist"));
        }

        [Fact]
        public void GetExists()
        {
            QuestionTemplateService questionTemplateService = new QuestionTemplateService(fixture.context);
            QuestionTemplate questionTemplate = questionTemplateService.GetAll().First();

            ProjectService projectService = new ProjectService(fixture.context);
            Project project = projectService.Create("QuestionService_GetExists");
            EvaluationService evaluationService = new EvaluationService(fixture.context);
            Evaluation evaluation = evaluationService.Create("QuestionService_GetExists", project, "");

            QuestionService questionService = new QuestionService(fixture.context);
            Question questionCreate = questionService.Create(questionTemplate, evaluation);

            Question questionGet = questionService.GetQuestion(questionCreate.Id).First();

            Assert.Equal(questionCreate, questionGet);
        }
    }
}
