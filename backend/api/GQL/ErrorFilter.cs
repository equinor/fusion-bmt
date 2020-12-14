using HotChocolate;
using Microsoft.Extensions.Logging;

namespace api.GQL
{
    class ErrorFilter : IErrorFilter
    {
        private readonly ILogger _logger;
        public ErrorFilter(ILogger<ErrorFilter> logger)
        {
            _logger = logger;
        }
        public IError OnError(IError error)
        {
            if (error.Exception != null)
            {
                _logger.LogError(error.Exception.ToString());
                return error.WithMessage(error.Exception.Message);
            }
            else
            {
                _logger.LogError(error.ToString());
                return error;
            }
        }
    }
}
