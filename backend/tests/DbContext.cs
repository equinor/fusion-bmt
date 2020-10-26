using System.Collections.Generic;
using System.Linq;
using Xunit;

using api.Context;
using api.Models;

namespace tests
{
    public class DbContextTests
    {
        [Fact]
        public void InitQuestions()
        {
            List<Question> questions = InitContent.Questions;

            Assert.Equal(11, questions.Count());
        }
    }
}
