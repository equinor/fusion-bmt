using System;
using System.Linq;
using System.Collections.Generic;

using Xunit;

using api.Models;
using api.Services;

using Microsoft.EntityFrameworkCore;

namespace tests
{
    [Collection("Database collection")]
    public class ProjectCategoryServiceTest
    {
        DatabaseFixture fixture;

        public ProjectCategoryServiceTest(DatabaseFixture fixture)
        {
            this.fixture = fixture;
        }
        [Fact]
        public void GetQueryable()
        {
            var service = new AnswerService(fixture.context);

            Assert.True(service.GetAll().Count() > 0);
        }

        [Fact]
        public void Create()
        {
            var service = new ProjectCategoryService(fixture.context);

            int nCategories = service.GetAll().Count();
            service.Create(Randomize.String());

            Assert.Equal(nCategories + 1, service.GetAll().Count());
        }

        [Fact]
        public void Delete()
        {
            var service = new ProjectCategoryService(fixture.context);
            int nCategories = service.GetAll().Count();
            var oldProjectCategory = service.GetAll().First();
            var newProjectCategory = service.CopyFrom(Randomize.String(), oldProjectCategory);

            var qtService = new QuestionTemplateService(fixture.context);
            var questionTemplate  = qtService
                .GetAll()
                .Include(x => x.ProjectCategories)
                .First(x => x.ProjectCategories.Contains(newProjectCategory))
            ;

            service.Delete(newProjectCategory);

            questionTemplate = qtService.GetQuestionTemplate(questionTemplate.Id);
            Assert.False(questionTemplate.ProjectCategories.Contains(newProjectCategory));

            Assert.Equal(nCategories, service.GetAll().Count());
        }

        [Fact]
        public void CopyFrom()
        {
            var service = new ProjectCategoryService(fixture.context);
            var nProjectCategories = service.GetAll().Count();
            var other = service.GetAll().First();
            var nTemplates = other.QuestionTemplates.Count();

            var projectCategory = service.CopyFrom(Randomize.String(), other);

            Assert.Equal(nProjectCategories + 1, service.GetAll().Count());
            Assert.Equal(nTemplates, projectCategory.QuestionTemplates.Count());
        }

        [Fact]
        public void GetExising()
        {
            var service = new ProjectCategoryService(fixture.context);

            var name = Randomize.String();
            var exisingId = service.Create(name).Id;
            var exists = service.Get(exisingId);

            Assert.Equal(name, exists.Name);
        }

        [Fact]
        public void GetNonExisting()
        {
            var service = new ProjectCategoryService(fixture.context);

            var nonExistingId = Randomize.String();

            Assert.Throws<NotFoundInDBException>(
                () => service.Get(nonExistingId)
            );
        }
    }
}

