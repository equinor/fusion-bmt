using Microsoft.AspNetCore.Mvc.Testing;
using System.Threading.Tasks;
using Xunit;

using api;

namespace tests
{
    [Collection("Database collection")]
    public class ComponentTest
    {
        private readonly WebApplicationFactory<Startup> factory = new WebApplicationFactory<Startup>();
        DatabaseFixture fixture;

        public ComponentTest(DatabaseFixture fixture)
        {
            this.fixture = fixture;
        }

        [Fact]
        public async Task StartupTest()
        {
            var client = factory.CreateClient();

            var response = await client.GetAsync("/swagger/index.html");

            var responseMessage = response.EnsureSuccessStatusCode();
            Assert.True(responseMessage.IsSuccessStatusCode);
        }
    }
}
