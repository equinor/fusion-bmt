using System;
using Microsoft.AspNetCore.Http;

using api.Services;
using api.Models;
using System.Collections.Generic;
using System.Linq;

namespace api.Authorization
{
    public interface IAuthService
    {
        public string GetOID();
        public IEnumerable<string> GetRoles();
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

        public IEnumerable<string> GetRoles()
        {
            var httpContext = _contextAccessor.HttpContext;
            var roles = httpContext
                .User
                .FindAll("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")
                .Select(i => i.Value)
            ;
            return roles;
        }
    }
}
