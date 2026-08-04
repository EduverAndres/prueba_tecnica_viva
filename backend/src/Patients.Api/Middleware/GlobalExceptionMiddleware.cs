using FluentValidation;
using Patients.Application.Exceptions;

namespace Patients.Api.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            await HandleAsync(context, exception);
        }
    }

    private async Task HandleAsync(HttpContext context, Exception exception)
    {
        var (statusCode, message, details) = exception switch
        {
            PatientNotFoundException => (StatusCodes.Status404NotFound, exception.Message, (string[]?)null),
            DuplicatePatientException => (StatusCodes.Status409Conflict, exception.Message, (string[]?)null),
            ValidationException validation => (StatusCodes.Status400BadRequest, "Validation failed.", validation.Errors.Select(e => e.ErrorMessage).ToArray()),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred.", (string[]?)null)
        };

        if (statusCode == StatusCodes.Status500InternalServerError)
        {
            _logger.LogError(exception, "Unhandled exception while processing {Method} {Path}", context.Request.Method, context.Request.Path);
        }

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new DTOs.ApiError(message, details));
    }
}
