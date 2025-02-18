using System.Net;
using Newtonsoft.Json;

namespace api.Helpers;
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate requestDelegate, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = requestDelegate;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleException(context, ex);
        }
        finally
        {

            _logger.LogInformation(
                "Request {trace} {user} {method} {url} => {statusCode}",
                context.TraceIdentifier,
                context.User?.Identity?.Name,
                context.Request?.Method,
                context.Request?.Path.Value,
                context.Response?.StatusCode);
        }
    }

    private Task HandleException(HttpContext context, Exception ex)
    {
        _logger.LogError(ex.ToString());
        var errorMessageObject = new { Message = ex.Message, Code = "system_error" };

        var errorMessage = JsonConvert.SerializeObject(errorMessageObject);
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
        return context.Response.WriteAsync(errorMessage);
    }
}
