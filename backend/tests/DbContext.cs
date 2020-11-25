using Microsoft.Extensions.DependencyInjection;

using System;
using System.Collections.Generic;
using System.Linq;
using Xunit;

using api.Authorization;
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
        public void TestSchema()
        {
            IRequestExecutor executor = MakeExecutor();
            IServiceProvider serviceProvider = BuildServiceProvider();
            IReadOnlyQueryRequest request = QueryRequestBuilder.New()
                .SetQuery(@"{
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
                }")
                .SetServices(serviceProvider)
                .Create();

            IExecutionResult result = executor.Execute(request);

            IReadOnlyList<IError> errors = result.Errors ?? new List<IError>();
            foreach( IError err in errors)
            {
                throw err.Exception;
            }
        }

        [Fact]
        public void TestSetAnswerMutation()
        {
            QuestionService questionService = new QuestionService(_context);
            string questionId = questionService.GetAll().First().Id;
            IRequestExecutor executor = MakeExecutor();
            IServiceProvider serviceProvider = BuildServiceProvider();
            IReadOnlyQueryRequest request = QueryRequestBuilder.New()
                .SetQuery(@"
                    mutation(
                        $questionId: String!,
                        $severity: Severity!
                    ) {
                        setAnswer(
                            questionId: $questionId,
                            severity: $severity,
                            text: ""New answer text!""
                        ){
                            id
                        }
                    }
                ")
                .SetVariableValue("questionId", questionId)
                .SetVariableValue("severity", Severity.High)
                .SetServices(serviceProvider)
                .Create();

            IExecutionResult result = executor.Execute(request);

            IReadOnlyList<IError> errors = result.Errors ?? new List<IError>();
            foreach( IError err in errors)
            {
                throw err.Exception;
            }
        }

        private IRequestExecutor MakeExecutor()
        {
            ISchema schema = SchemaBuilder.New()
                .AddQueryType<GraphQuery>()
                .AddMutationType<Mutation>()
                .AddFiltering()
                .AddProjections()
                .Create();
            return schema.MakeExecutable();
        }

        private IServiceProvider BuildServiceProvider()
        {
            IServiceProvider serviceProvider = new ServiceCollection()
                .AddBatchDispatcher<BatchScheduler>()
                .AddDbContext<BmtDbContext>()
                .AddScoped<IAuthService, MockAuthService>()
                .AddScoped<GraphQuery>()
                .AddScoped<ProjectService>()
                .AddScoped<ParticipantService>()
                .AddScoped<EvaluationService>()
                .AddScoped<QuestionService>()
                .AddScoped<AnswerService>()
                .AddScoped<QuestionTemplateService>()
                .AddScoped<Mutation>()
                .BuildServiceProvider();
            return serviceProvider;
        }

        class MockAuthService : IAuthService
        {
            public string GetOID()
            {
                return "1";
            }
        }
    }
}
