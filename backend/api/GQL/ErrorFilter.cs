namespace api.GQL;

class ErrorFilter(ILogger<ErrorFilter> logger) : IErrorFilter
{
    private readonly ILogger _logger = logger;

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