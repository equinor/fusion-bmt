using System;
using System.Security.Claims;
using System.Threading.Tasks;
using System.IO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;

namespace api.Authorization
{

    public class AuthorAuthHandler : AuthorizationHandler<AuthorRequirement>
    {
        private IHttpContextAccessor _contextAccessor;

        public AuthorAuthHandler(IHttpContextAccessor contextAccessor)
        {
            _contextAccessor = contextAccessor;
        }
        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context,
                                                    AuthorRequirement requirement)
        {
            var oid = context.User.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier").Value;

            var p = context.Resource;
            var h = _contextAccessor.HttpContext;
            var reader = new StreamReader(h.Request.Body);
            var body = reader.ReadToEndAsync();

            if (oid != null)
            {
                context.Succeed(requirement);
            }

            return Task.CompletedTask;
        }
    }

}

