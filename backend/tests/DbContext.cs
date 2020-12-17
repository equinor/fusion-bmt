using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;

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
    public class DbContextTests : DbContextTestSetup
    {
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
            Evaluation evaluation = evaluationService.GetAll().First();
            ParticipantService participantService = new ParticipantService(_context);

            int participantsBefore = evaluation.Participants.Count;
            participantService.Create("ParticipantAddedToEvaluation_id", evaluation, Organization.Engineering, Role.Participant);
            int participantsAfter = evaluation.Participants.Count;

            Assert.Equal(participantsBefore + 1, participantsAfter);
        }

        [Fact]
        public void ParticipantAddedToProject()
        {
            ProjectService projectService = new ProjectService(_context);
            Project project = projectService.GetAll().First();
            Evaluation evaluation = project.Evaluations.First();
            ParticipantService participantService = new ParticipantService(_context);

            int participantsBefore = project.Evaluations.First().Participants.Count;
            participantService.Create("ParticipantAddedToProject", evaluation, Organization.Engineering, Role.Participant);
            int participantsAfter = project.Evaluations.First().Participants.Count;

            Assert.Equal(participantsBefore + 1, participantsAfter);
        }

        [Fact]
        public void ParticipantDeletedFromEvaluation()
        {
            EvaluationService evaluationService = new EvaluationService(_context);
            Evaluation evaluation = evaluationService.GetAll().First();
            ParticipantService participantService = new ParticipantService(_context);
            Participant participant = participantService.Create("ParticipantDeletedFromEvaluation_id", evaluation, Organization.Engineering, Role.Participant);

            int participantsBefore = evaluation.Participants.Count;
            participantService.Remove(participant.Id);
            int participantsAfter = evaluation.Participants.Count;

            Assert.Equal(participantsBefore - 1, participantsAfter);
        }

        [Fact]
        public void ParticipantUnique()
        {
            DbContextOptionsBuilder<BmtDbContext> builder = new DbContextOptionsBuilder<BmtDbContext>();
            builder.UseSqlite(_connection);

            // This is done because bug in xunit making Dbcontext dispose never being called when exception is thrown
            using (var _context = new BmtDbContext(builder.Options))
            {
                EvaluationService evaluationService = new EvaluationService(_context);
                Evaluation evaluation = evaluationService.GetAll().First();

                ParticipantService participantService = new ParticipantService(_context);
                participantService.Create("azure_unique_id", evaluation, Organization.All, Role.OrganizationLead);
                Assert.Throws<DbUpdateException>(() => participantService.Create("azure_unique_id", evaluation, Organization.All, Role.OrganizationLead));
            }
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
            foreach (IError err in errors)
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
                        $severity: Severity!,
                        $progression: Progression!
                    ) {
                        setAnswer(
                            questionId: $questionId,
                            severity: $severity,
                            text: ""New answer text!"",
                            progression: $progression
                        ){
                            id
                        }
                    }
                ")
                .SetVariableValue("questionId", questionId)
                .SetVariableValue("severity", Severity.High)
                .SetVariableValue("progression", Progression.Preparation)
                .SetServices(serviceProvider)
                .Create();

            IExecutionResult result = executor.Execute(request);

            IReadOnlyList<IError> errors = result.Errors ?? new List<IError>();
            foreach (IError err in errors)
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
                .AddDbContext<BmtDbContext>(options => options.UseSqlite(_connection))
                .AddLogging()
                .AddScoped<IAuthService, MockAuthService>()
                .AddScoped<GraphQuery>()
                .AddScoped<ProjectService>()
                .AddScoped<ParticipantService>()
                .AddScoped<EvaluationService>()
                .AddScoped<QuestionService>()
                .AddScoped<AnswerService>()
                .AddScoped<QuestionTemplateService>()
                .AddScoped<ActionService>()
                .AddScoped<NoteService>()
                .AddScoped<Mutation>()
                .BuildServiceProvider();
            return serviceProvider;
        }
    }
}
