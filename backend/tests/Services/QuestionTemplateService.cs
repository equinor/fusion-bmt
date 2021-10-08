using System;
using System.Collections.Generic;
using System.Linq;
using Xunit;

using api.Models;
using api.Services;

namespace tests
{
    [Collection("Database collection")]
    public class QuestionTemplateServiceTest
    {
        DatabaseFixture fixture;

        public QuestionTemplateServiceTest(DatabaseFixture fixture)
        {
            this.fixture = fixture;
        }

        [Fact]
        public void GetQueryable()
        {
            QuestionTemplateService questionTemplateService = new QuestionTemplateService(fixture.context);

            IQueryable<QuestionTemplate> questions = questionTemplateService.GetAll();

            Assert.True(questions.Count() > 0);
        }

        [Fact]
        public void Create()
        {
            QuestionTemplateService questionTemplateService = new QuestionTemplateService(fixture.context);

            int nQuestionTemplatesBefore = questionTemplateService.GetAll().Count();
            questionTemplateService.Create(Barrier.GM, Organization.All, "text", "supportNotes");
            int nQuestionTemplatesAfter = questionTemplateService.GetAll().Count();

            Assert.Equal(nQuestionTemplatesBefore + 1, nQuestionTemplatesAfter);
        }

        [Fact]
        public void GetDoesNotExist()
        {
            QuestionTemplateService questionTemplateService = new QuestionTemplateService(fixture.context);

            Assert.Throws<NotFoundInDBException>(() => questionTemplateService.GetQuestionTemplate("some_action_id_that_does_not_exist"));
        }

        [Fact]
        public void GetExists()
        {
            QuestionTemplateService questionTemplateService = new QuestionTemplateService(fixture.context);

            QuestionTemplate questionTemplateCreate = questionTemplateService.Create(Barrier.GM, Organization.All, "text", "supportNotes");

            QuestionTemplate questionTemplateGet = questionTemplateService.GetQuestionTemplate(questionTemplateCreate.Id);

            Assert.Equal(questionTemplateCreate, questionTemplateGet);
        }

        [Fact]
        public void EditQuestionTemplate()
        {
            var service = new QuestionTemplateService(fixture.context);
            Barrier barrier = Randomize.Barrier();
            var originalQT = service.Create(
                barrier:      barrier,
                organization: Randomize.Organization(),
                text:         Randomize.String(),
                supportNotes: Randomize.String()
            );

            var projectCategory  = new ProjectCategoryService(fixture.context).GetAll().First();
            originalQT = service.AddToProjectCategory(originalQT.Id, projectCategory.Id);

            var nTemplates = service.GetAll().Count();
            var nActive = service.ActiveQuestions(projectCategory).Count();

            var newText         = Randomize.String();
            var newSupportNotes = Randomize.String();
            var newOrganization = Randomize.Organization();

            var updatedQT = service.Edit(
                questionTemplate: originalQT,
                barrier:          barrier,
                organization:     newOrganization,
                text:             newText,
                supportNotes:     newSupportNotes,
                status:           Status.Active
            );

            Assert.Equal(nTemplates + 1, service.GetAll().Count());
            Assert.Equal(nActive, service.ActiveQuestions(projectCategory).Count());

            Assert.Equal(newText,          updatedQT.Text);
            Assert.Equal(newSupportNotes,  updatedQT.SupportNotes);
            Assert.Equal(barrier,          updatedQT.Barrier);
            Assert.Equal(newOrganization,  updatedQT.Organization);

            Assert.Equal(originalQT,       updatedQT.previous);
            Assert.True(updatedQT.ProjectCategories.Count() == 1);
        }

        [Fact]
        public void DeleteQuestionTemplate()
        {
            var service = new QuestionTemplateService(fixture.context);
            var questionTemplateToDelete = service.Create(
                barrier:      Randomize.Barrier(),
                organization: Randomize.Organization(),
                text:         Randomize.String(),
                supportNotes: Randomize.String()
            );
            
            var projectCategory  = new ProjectCategoryService(fixture.context).GetAll().First();
            questionTemplateToDelete = service.AddToProjectCategory(questionTemplateToDelete.Id, projectCategory.Id);

            var deletedQuestionTemplate = service.Delete(questionTemplateToDelete);
            
            int maxOrder = fixture.context.QuestionTemplates.Max(qt => qt.Order);

            Assert.Equal(deletedQuestionTemplate.Order, maxOrder);
            Assert.True(deletedQuestionTemplate.Status == Status.Voided);
            Assert.Equal(deletedQuestionTemplate.ProjectCategories, questionTemplateToDelete.ProjectCategories);
        }

        [Fact]
        public void ReorderQuestionTemplate()
        {
            QuestionTemplateService questionTemplateService = new QuestionTemplateService(fixture.context);
            IQueryable<QuestionTemplate> getAll = questionTemplateService.GetAll();

            QuestionTemplate questionTemplate = getAll
                .Where(qt => qt.Status == Status.Active)
                .First(qt => qt.Order == 3)
            ;
            QuestionTemplate newNextQuestionTemplate = getAll
                .Where(qt => qt.Status == Status.Active)
                .First(qt => qt.Order == 10)
            ;
            int newOrder = newNextQuestionTemplate.Order;

            QuestionTemplate resultingQuestionTemplate = questionTemplateService.ReorderQuestionTemplate(questionTemplate, newNextQuestionTemplate);
            Assert.Equal(newOrder - 1, resultingQuestionTemplate.Order);
        }

        [Fact]
        public void ReorderQuestionTemplateToLast()
        {
            QuestionTemplateService questionTemplateService = new QuestionTemplateService(fixture.context);
            IQueryable<QuestionTemplate> getAll = questionTemplateService.GetAll();

            QuestionTemplate questionTemplate = getAll
                .Where(qt => qt.Status == Status.Active)
                .First(qt => qt.Order == 2)
            ;
            int newOrder = getAll
                .Where(qt => qt.Status == Status.Active)
                .Max(qt => qt.Order)
            ;
            QuestionTemplate resultingQuestionTemplate = questionTemplateService.ReorderQuestionTemplate(questionTemplate);

            Assert.Equal(newOrder, resultingQuestionTemplate.Order);
        }

        [Fact]
        public void DoNotReorderInactiveQuestionTemplate()
        {
            QuestionTemplateService questionTemplateService = new QuestionTemplateService(fixture.context);
            IQueryable<QuestionTemplate> getAll = questionTemplateService.GetAll();
            // Edit a question template to make sure an inactive question template exists
            var originalQT = getAll.First();
            var updatedQT = questionTemplateService.Edit(
                questionTemplate: originalQT,
                barrier:          originalQT.Barrier,
                organization:     Randomize.Organization(),
                text:             Randomize.String(),
                supportNotes:     Randomize.String(),
                status:           Status.Active
            );

            var inactiveQuestionTemplate = getAll
                .Where(qt => qt.Status == Status.Inactive)
                .First()
            ;

            QuestionTemplate resultingQuestionTemplate = questionTemplateService.ReorderQuestionTemplate(inactiveQuestionTemplate);

            Assert.Equal(inactiveQuestionTemplate.Order, resultingQuestionTemplate.Order);
        }

        [Fact]
        public void AddToProjectCategory()
        {
            var projectCategoryService = new ProjectCategoryService(fixture.context);
            var projectCategory = projectCategoryService.Create(Randomize.String());

            var service = new QuestionTemplateService(fixture.context);
            var nActive = service.ActiveQuestions(projectCategory).Count();
            var nTemplates = service.GetAll().Count();
            var template = service.GetAll().First();

            var updatedQT = service.AddToProjectCategory(template.Id, projectCategory.Id);
            var updatedSP = projectCategoryService.Get(projectCategory.Id);

            Assert.True(updatedQT.ProjectCategories.Contains(updatedSP));
            Assert.True(updatedSP.QuestionTemplates.Contains(updatedQT));

            Assert.Equal(nActive + 1, service.ActiveQuestions(projectCategory).Count());
            Assert.Equal(nTemplates,  service.GetAll().Count());

            /* Adding the same QuestionTemplate should fail */
            Assert.Throws<Exception>(() =>
                service.AddToProjectCategory(template.Id, projectCategory.Id)
            );
        }

        [Fact]
        public void RemoveFromProjectCategory()
        {
            var projectCategoryService = new ProjectCategoryService(fixture.context);
            var projectCategory = projectCategoryService.Create(Randomize.String());

            var service = new QuestionTemplateService(fixture.context);
            var template = service.GetAll().First();

            service.AddToProjectCategory(template.Id, projectCategory.Id);

            var nActive = service.ActiveQuestions(projectCategory).Count();
            var nTemplates = service.GetAll().Count();

            var updatedQT = service.RemoveFromProjectCategory(template.Id, projectCategory.Id);
            var updatedSP = projectCategoryService.Get(projectCategory.Id);

            Assert.False(updatedQT.ProjectCategories.Contains(updatedSP));
            Assert.False(updatedSP.QuestionTemplates.Contains(updatedQT));

            Assert.Equal(nActive - 1, service.ActiveQuestions(projectCategory).Count());
            Assert.Equal(nTemplates,  service.GetAll().Count());

            /* Removing the same QuestionTemplate should fail */
            Assert.Throws<Exception>(() =>
                service.RemoveFromProjectCategory(template.Id, projectCategory.Id)
            );
        }
    }
}
