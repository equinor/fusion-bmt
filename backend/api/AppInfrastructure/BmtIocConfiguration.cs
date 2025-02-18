using api.Authorization;
using api.GQL;
using api.Services;

namespace api.AppInfrastructure;

public static class BmtIocConfiguration
{
    public static void AddBmtIocConfiguration(this IServiceCollection services)
    {
        services.AddScoped<GraphQuery>();
        services.AddScoped<Mutation>();
        services.AddScoped<ProjectService>();
        services.AddScoped<ParticipantService>();
        services.AddScoped<EvaluationService>();
        services.AddScoped<QuestionService>();
        services.AddScoped<AnswerService>();
        services.AddScoped<ActionService>();
        services.AddScoped<NoteService>();
        services.AddScoped<ClosingRemarkService>();
        services.AddScoped<QuestionTemplateService>();
        services.AddScoped<ProjectCategoryService>();
        services.AddScoped<BMTScoreService>();
        services.AddScoped<IAuthService, AuthService>();
    }
}
