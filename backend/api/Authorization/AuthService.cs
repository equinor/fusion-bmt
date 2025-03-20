using api.Services;

namespace api.Authorization;

public interface IAuthService
{
    public string GetOid();

    public IEnumerable<string> GetRoles();
}

public class AuthService(
    IHttpContextAccessor contextAccessor,
    ParticipantService participantService,
    EvaluationService evaluationService)
    : IAuthService
{
    private readonly ParticipantService _participantService = participantService;
    private readonly EvaluationService _evaluationService = evaluationService;

    public string GetOid()
    {
        var httpContext = contextAccessor.HttpContext;
        var oid = httpContext.User.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier").Value;

        return oid;
    }

    public IEnumerable<string> GetRoles()
    {
        var httpContext = contextAccessor.HttpContext;

        var roles = httpContext
                    .User
                    .FindAll("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")
                    .Select(i => i.Value)
            ;

        return roles;
    }
}