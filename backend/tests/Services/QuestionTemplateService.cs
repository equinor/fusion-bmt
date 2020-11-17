using System.Collections.Generic;
using System.Linq;
using Xunit;

using api.Context;
using api.Models;
using api.Services;

namespace tests
{
    [Collection("UsesDbContext")]
    public class QuestionTemplateServiceTest
    {
        private readonly BmtDbContext _context;
        public QuestionTemplateServiceTest()
        {
            _context = Globals.context;
        }

        [Fact]
        public void GetQueryable()
        {
            QuestionTemplateService questionTemplateService = new QuestionTemplateService(_context);

            IQueryable<QuestionTemplate> questions = questionTemplateService.GetAll();

            Assert.True(questions.Count() > 0);
        }

        [Fact]
        public void ActiveQuestions()
        {
            QuestionTemplateService questionTemplateService = new QuestionTemplateService(_context);

            List<QuestionTemplate> questionTemplates = questionTemplateService.ActiveQuestions();

            Assert.Equal(11, questionTemplates.Count);
            foreach (QuestionTemplate qt in questionTemplates)
            {
                Assert.True(qt.Status.Equals(Status.Active));
            }
        }
    }
}
