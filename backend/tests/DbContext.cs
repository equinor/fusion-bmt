using Microsoft.Extensions.DependencyInjection;

using System;
using System.Collections.Generic;
using System.Linq;
using Xunit;

using api.Context;
using api.GQL;
using api.Services;
using api.Models;

using HotChocolate;
using HotChocolate.Execution;
using HotChocolate.Fetching;

namespace tests
{
    [Collection("UsesDbContext")]
    public class DbContextTests
    {
        private readonly BmtDbContext _context;
        public DbContextTests()
        {
            _context = Globals.context;
        }

        [Fact]
        public void InitQuestions()
        {
            List<QuestionTemplate> questions = InitContent.QuestionTemplates;

            Assert.Equal(11, questions.Count());
        }


        [Fact]
        public void ParticipantAddedToEvaluation()
        {
            EvaluationService evaluationService = new EvaluationService(_context);
            Evaluation exampleEvaluation = evaluationService.GetAll().First();
            ParticipantService participantService = new ParticipantService(_context);

            int participantsBefore = exampleEvaluation.Participants.Count;
            participantService.Create("some_id_we_got_from_fusion", exampleEvaluation, Organization.Engineering, Role.Participant);
            int participantsAfter = exampleEvaluation.Participants.Count;

            Assert.Equal(participantsBefore + 1, participantsAfter);
        }

        [Fact]
        public void ParticipantAddedToProject()
        {
            ProjectService projectService = new ProjectService(_context);
            Project exampleProject = projectService.GetAll().First();
            Evaluation exampleEvaluation = exampleProject.Evaluations.First();
            ParticipantService participantService = new ParticipantService(_context);

            int participantsBefore = exampleProject.Evaluations.First().Participants.Count;
            participantService.Create("some_id_we_got_from_fusion", exampleEvaluation, Organization.Engineering, Role.Participant);
            int participantsAfter = exampleProject.Evaluations.First().Participants.Count;

            Assert.Equal(participantsBefore + 1, participantsAfter);
        }

        [Fact]
        public void ParticipantDeletedFromEvaluation()
        {
            EvaluationService evaluationService = new EvaluationService(_context);
            Evaluation exampleEvaluation = evaluationService.GetAll().First();
            ParticipantService participantService = new ParticipantService(_context);
            Participant exampleParticipant = participantService.Create("ParticipantDeletedFromEvaluation_id", exampleEvaluation, Organization.Engineering, Role.Participant);

            int participantsBefore = exampleEvaluation.Participants.Count;
            participantService.Remove(exampleParticipant.Id);
            int participantsAfter = exampleEvaluation.Participants.Count;

            Assert.Equal(participantsBefore - 1, participantsAfter);
        }

        [Fact]
        public async void TestSchema()
        {
            ISchema schema = SchemaBuilder.New()
                .AddQueryType<GraphQuery>()
                .AddFiltering()
                .AddProjections()
                .Create();
            var executor = schema.MakeExecutable();
            IServiceProvider serviceProvider = new ServiceCollection()
                .AddBatchDispatcher<BatchScheduler>()
                .AddDbContext<BmtDbContext>()
                .AddScoped<GraphQuery>()
                .AddScoped<ProjectService>()
                .AddScoped<ParticipantService>()
                .AddScoped<EvaluationService>()
                .AddScoped<QuestionService>()
                .AddScoped<AnswerService>()
                .AddScoped<QuestionTemplateService>()
                .AddScoped<Mutation>()
                .BuildServiceProvider();

            string query = @"{
                projects {
                    id
                    evaluations {
                        id
                        participants {
                            id
                        }
                        questions {
                            id
                            answers {
                                id
                            }
                            actions {
                                id
                                notes {
                                    id
                                }
                            }
                        }
                    }
                }
            }";
            IReadOnlyQueryRequest request = QueryRequestBuilder.New()
                .SetQuery(query)
                .SetServices(serviceProvider)
                .Create();

            IExecutionResult result = await executor.ExecuteAsync(request);

            IReadOnlyList<IError> errors = result.Errors ?? new List<IError>();
            foreach( IError err in errors)
            {
                throw err.Exception;
            }
        }
    }
}
