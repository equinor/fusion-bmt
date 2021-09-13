using System.Collections.Generic;
using System.Linq;
using Xunit;

using api.Models;
using api.Services;

namespace tests
{
    [Collection("UsesDbContext")]
    public class QuestionTemplateServiceTest : DbContextTestSetup
    {
        [Fact]
        public void GetQueryable()
        {
            QuestionTemplateService questionTemplateService = new QuestionTemplateService(_context);

            IQueryable<QuestionTemplate> questions = questionTemplateService.GetAll();

            Assert.True(questions.Count() > 0);
        }

        [Fact]
        public void Create()
        {
            QuestionTemplateService questionTemplateService = new QuestionTemplateService(_context);

            int nQuestionTemplatesBefore = questionTemplateService.GetAll().Count();
            questionTemplateService.Create(Barrier.GM, Organization.All, "text", "supportNotes");
            int nQuestionTemplatesAfter = questionTemplateService.GetAll().Count();

            Assert.Equal(nQuestionTemplatesBefore + 1, nQuestionTemplatesAfter);
        }

        [Fact]
        public void GetDoesNotExist()
        {
            QuestionTemplateService questionTemplateService = new QuestionTemplateService(_context);

            Assert.Throws<NotFoundInDBException>(() => questionTemplateService.GetQuestionTemplate("some_action_id_that_does_not_exist"));
        }

        [Fact]
        public void GetExists()
        {
            QuestionTemplateService questionTemplateService = new QuestionTemplateService(_context);

            QuestionTemplate questionTemplateCreate = questionTemplateService.Create(Barrier.GM, Organization.All, "text", "supportNotes");

            QuestionTemplate questionTemplateGet = questionTemplateService.GetQuestionTemplate(questionTemplateCreate.Id);

            Assert.Equal(questionTemplateCreate, questionTemplateGet);
        }

        [Fact]
        public void EditQuestionTemplate()
        {
            QuestionTemplateService questionTemplateService = new QuestionTemplateService(_context);
            string initialText = "initial text";
            QuestionTemplate questionTemplate = questionTemplateService.Create(Barrier.GM, Organization.All, initialText, "supportNotes");

            string newtext = "new text";
            Barrier newBarrier = Barrier.PS1;
            QuestionTemplate resultingQuestionTemplate = questionTemplateService.Edit(questionTemplate, newBarrier, Organization.Commissioning, newtext, "supportNotes", Status.Active);

            Assert.Equal(newtext, resultingQuestionTemplate.Text);
            Assert.Equal(newBarrier, resultingQuestionTemplate.Barrier);
            Assert.Equal(questionTemplate, resultingQuestionTemplate.previous);
        }

        [Fact]
        public void ReorderQuestionTemplate()
        {
            QuestionTemplateService questionTemplateService = new QuestionTemplateService(_context);
            IQueryable<QuestionTemplate> getAll = questionTemplateService.GetAll();

            QuestionTemplate questionTemplate = getAll.ToList()[3];
            QuestionTemplate newNextQuestionTemplate = getAll.ToList()[10];
            int newOrder = newNextQuestionTemplate.Order;

            QuestionTemplate resultingQuestionTemplate = questionTemplateService.ReorderQuestionTemplate(questionTemplate, newNextQuestionTemplate);
            Assert.Equal(newOrder - 1, resultingQuestionTemplate.Order);
        }

        [Fact]
        public void ReorderQuestionTemplateToLast()
        {
            QuestionTemplateService questionTemplateService = new QuestionTemplateService(_context);
            IQueryable<QuestionTemplate> getAll = questionTemplateService.GetAll();

            QuestionTemplate questionTemplate = getAll.ToList()[3];
            int newOrder = _context.QuestionTemplates.Max(qt => qt.Order);
            QuestionTemplate resultingQuestionTemplate = questionTemplateService.ReorderQuestionTemplate(questionTemplate);

            Assert.Equal(newOrder, resultingQuestionTemplate.Order);
        }
    }
}
