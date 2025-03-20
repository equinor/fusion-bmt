using System.Net;
using Newtonsoft.Json;

namespace api.Helpers;

public class RequestLoggingMiddleware(RequestDelegate requestDelegate, ILogger<RequestLoggingMiddleware> logger)
{
    public async Task Invoke(HttpContext context)
    {
        try
        {
            await requestDelegate(context);
        }
        catch (Exception ex)
        {
            await HandleException(context, ex);
        }
        finally
        {
            logger.LogInformation(
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
        logger.LogError(ex.ToString());
        var errorMessageObject = new { Message = ex.Message, Code = "system_error" };

        var errorMessage = JsonConvert.SerializeObject(errorMessageObject);
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        return context.Response.WriteAsync(errorMessage);
    }
}
