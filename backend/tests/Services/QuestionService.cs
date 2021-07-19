using System.Collections.Generic;
using System.Linq;
using Xunit;

using api.Models;
using api.Services;

namespace tests
{
    [Collection("UsesDbContext")]
    public class QuestionServiceTest : DbContextTestSetup
    {
        [Fact]
        public void GetQueryable()
        {
            QuestionService questionService = new QuestionService(_context);

            IQueryable<Question> questionQueryable = questionService.GetAll();

            Assert.True(questionQueryable.Count() > 0);
        }

        [Fact]
        public void Create()
        {
            QuestionTemplateService questionTemplateService = new QuestionTemplateService(_context);
            QuestionTemplate questionTemplate = questionTemplateService.GetAll().First();

            ProjectService projectService = new ProjectService(_context);
            Project project = projectService.Create("QuestionService_Create");
            EvaluationService evaluationService = new EvaluationService(_context);
            Evaluation evaluation = evaluationService.Create("QuestionService_Create", project, "");

            QuestionService questionService = new QuestionService(_context);

            int nQuestionBefore = questionService.GetAll().Count();
            questionService.Create(questionTemplate, evaluation);
            int nQuestionsAfter = questionService.GetAll().Count();

            Assert.Equal(nQuestionBefore + 1, nQuestionsAfter);
        }

        [Fact]
        public void CreateBulk()
        {
            QuestionTemplateService questionTemplateService = new QuestionTemplateService(_context);
            List<QuestionTemplate> questionTemplates = questionTemplateService.GetAll().ToList();

            ProjectService projectService = new ProjectService(_context);
            Project project = projectService.Create("QuestionService_CreateBulk");
            EvaluationService evaluationService = new EvaluationService(_context);
            Evaluation evaluation = evaluationService.Create("QuestionService_CreateBulk", project, "");

            QuestionService questionService = new QuestionService(_context);

            int nQuestionBefore = questionService.GetAll().Count();
            questionService.CreateBulk(questionTemplates, evaluation);
            int nQuestionsAfter = questionService.GetAll().Count();

            Assert.Equal(nQuestionBefore + 15, nQuestionsAfter);
        }

        [Fact]
        public void GetDoesNotExist()
        {
            QuestionService questionService = new QuestionService(_context);

            Assert.Throws<NotFoundInDBException>(() => questionService.GetQuestion("some_question_id_that_does_not_exist"));
        }

        [Fact]
        public void GetExists()
        {
            QuestionTemplateService questionTemplateService = new QuestionTemplateService(_context);
            QuestionTemplate questionTemplate = questionTemplateService.GetAll().First();

            ProjectService projectService = new ProjectService(_context);
            Project project = projectService.Create("QuestionService_GetExists");
            EvaluationService evaluationService = new EvaluationService(_context);
            Evaluation evaluation = evaluationService.Create("QuestionService_GetExists", project, "");

            QuestionService questionService = new QuestionService(_context);
            Question questionCreate = questionService.Create(questionTemplate, evaluation);

            Question questionGet = questionService.GetQuestion(questionCreate.Id).First();

            Assert.Equal(questionCreate, questionGet);
        }
    }
}
