using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

using Xunit;

using api.Context;
using api.Models;
using api.Utils;

namespace tests
{
    class ObjectWithBarrier
    {
        public Barrier? Barrier { get; set; }
    }

    class ObjectWithOrganization
    {
        public Organization? Organization { get; set; }
    }

    public class JsonConvertersTests
    {
        [Fact]
        public void InitQuestions()
        {
            List<Question> questions = InitContent.Questions;

            Assert.Equal(11, questions.Count());
        }

        [Fact]
        public void BarrierTest()
        {
            string json = "{\"Barrier\": \"General matters\"}";

            ObjectWithBarrier objectWithBarrier = JsonSerializer.Deserialize<ObjectWithBarrier>(json, JsonUtils.SerializerOptions);

            Assert.Equal(Barrier.GM, objectWithBarrier.Barrier);
        }

        [Fact]
        public void OrganizationTest()
        {
            string json = "{\"Organization\": \"Preparing for operation\"}";

            ObjectWithOrganization objectWithOrganization = JsonSerializer.Deserialize<ObjectWithOrganization>(json, JsonUtils.SerializerOptions);

            Assert.Equal(Organization.PreOps, objectWithOrganization.Organization);
        }
    }
}
