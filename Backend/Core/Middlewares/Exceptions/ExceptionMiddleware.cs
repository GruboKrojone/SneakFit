using Microsoft.AspNetCore.Http;
using System.Text.Json;

namespace Core.Middlewares.Exceptions;

public class ExceptionMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext httpContext)
    {
        try
        {
            await next(httpContext);
        }
        catch (DomainException ex)
        {
            await HandleDomainExceptionAsync(httpContext, ex);
        }
    }

    private static Task HandleDomainExceptionAsync(HttpContext context, DomainException exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = StatusCodes.Status400BadRequest;

        var response = new
        {
            context.Response.StatusCode,
            exception.Message,
            exception.ErrorCode
        };

        var jsonResponse = JsonSerializer.Serialize(response);

        return context.Response.WriteAsync(jsonResponse);
    }
}