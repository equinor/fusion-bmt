using System;
using System.Linq;
using System.Collections.Generic;

using Xunit;

using api.Models;
using api.Services;

namespace tests
{
    [Collection("UsesDbContext")]
    public class ProjectCategoryServiceTest  : DbContextTestSetup
    {
        [Fact]
        public void GetQueryable()
        {
            var service = new AnswerService(_context);

            Assert.True(service.GetAll().Count() > 0);
        }

        [Fact]
        public void Create()
        {
            var service = new ProjectCategoryService(_context);

            int nCategories = service.GetAll().Count();
            service.Create(Randomize.String());

            Assert.Equal(nCategories + 1, service.GetAll().Count());
        }

        [Fact]
        public void GetExising()
        {
            var service = new ProjectCategoryService(_context);

            var name = Randomize.String();
            var exisingId = service.Create(name).Id;
            var exists = service.Get(exisingId);

            Assert.Equal(name, exists.Name);
        }

        [Fact]
        public void GetNonExisting()
        {
            var service = new ProjectCategoryService(_context);

            var nonExistingId = Randomize.String();

            Assert.Throws<NotFoundInDBException>(
                () => service.Get(nonExistingId)
            );
        }
    }
}

