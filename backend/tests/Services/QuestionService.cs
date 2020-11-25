using System.Collections.Generic;
using System.Linq;
using Xunit;

using api.Context;
using api.Models;
using api.Services;

namespace tests
{
    [Collection("UsesDbContext")]
    public class QuestionServiceTest
    {
        private readonly BmtDbContext _context;
        public QuestionServiceTest()
        {
            _context = Globals.context;
        }

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
            QuestionService questionService = new QuestionService(_context);

            int nQuestionBefore = questionService.GetAll().Count();
            questionService.Create(ExampleQuestionTemplates().First(), ExampleEvaluation());
            int nQuestionsAfter = questionService.GetAll().Count();

            Assert.Equal(nQuestionBefore + 1, nQuestionsAfter);
        }

        [Fact]
        public void CreateBulk()
        {
            QuestionService questionService = new QuestionService(_context);

            int nQuestionBefore = questionService.GetAll().Count();
            questionService.CreateBulk(ExampleQuestionTemplates(), ExampleEvaluation());
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
            QuestionService questionService = new QuestionService(_context);

            Question questionCreate = questionService.Create(ExampleQuestionTemplates().First(), ExampleEvaluation());

            Question questionGet = questionService.GetQuestion(questionCreate.Id).First();

            Assert.Equal(questionCreate, questionGet);
        }

        private Evaluation ExampleEvaluation()
        {
            EvaluationService evaluationService = new EvaluationService(_context);
            return evaluationService.GetAll().First();
        }

        private List<QuestionTemplate> ExampleQuestionTemplates()
        {
            QuestionTemplateService questionTemplateService = new QuestionTemplateService(_context);
            return questionTemplateService.GetAll().ToList();
        }
    }
}
