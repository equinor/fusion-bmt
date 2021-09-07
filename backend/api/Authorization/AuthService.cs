using System;
using Microsoft.AspNetCore.Http;

using api.Services;
using api.Models;

namespace api.Authorization
{
    public interface IAuthService
    {
        public string GetOID();
    }

    public class AuthService : IAuthService
    {
        private readonly IHttpContextAccessor _contextAccessor;
        private readonly ParticipantService _participantService;
        private readonly EvaluationService _evaluationService;
        public AuthService(
            IHttpContextAccessor contextAccessor,
            ParticipantService participantService,
            EvaluationService evaluationService
            )
        {
            _contextAccessor = contextAccessor;
            _participantService = participantService;
            _evaluationService = evaluationService;
        }
        public string GetOID()
        {
            var httpContext = _contextAccessor.HttpContext;
            string oid = httpContext.User.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier").Value;
            return oid;
        }
    }
}
