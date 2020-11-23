using Microsoft.AspNetCore.Http;

namespace api.Authorization
{
    public class AuthService
    {
        private readonly IHttpContextAccessor _contextAccessor;
        public AuthService(IHttpContextAccessor contextAccessor)
        {
            _contextAccessor = contextAccessor;
        }
        public string GetOID()
        {
            var httpContext = _contextAccessor.HttpContext;
            string oid = httpContext.User.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier").Value;
            return oid;
        }
    }
}
