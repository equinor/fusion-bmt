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

            EvaluationService evaluationService = new EvaluationService(_context);
            Evaluation evaluation = evaluationService.GetAll().First();

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

            EvaluationService evaluationService = new EvaluationService(_context);
            Evaluation evaluation = evaluationService.GetAll().First();

            QuestionService questionService = new QuestionService(_context);

            int nQuestionBefore = questionService.GetAll().Count();
            questionService.CreateBulk(questionTemplates, evaluation);
            int nQuestionsAfter = questionService.GetAll().Count();

            Assert.Equal(nQuestionBefore + 11, nQuestionsAfter);
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

            EvaluationService evaluationService = new EvaluationService(_context);
            Evaluation evaluation = evaluationService.GetAll().First();

            QuestionService questionService = new QuestionService(_context);
            Question questionCreate = questionService.Create(questionTemplate, evaluation);

            Question questionGet = questionService.GetQuestion(questionCreate.Id).First();

            Assert.Equal(questionCreate, questionGet);
        }
    }
}
