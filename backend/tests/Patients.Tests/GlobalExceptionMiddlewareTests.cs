using System.Text.Json;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using Patients.Api.Middleware;
using Patients.Application.Exceptions;

namespace Patients.Tests;

public class GlobalExceptionMiddlewareTests
{
    private static async Task<(int StatusCode, JsonElement Body)> InvokeAsync(Func<HttpContext, Task> next)
    {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        context.Request.Method = "GET";
        context.Request.Path = "/api/patients";

        var middleware = new GlobalExceptionMiddleware(
            _ => next(context),
            NullLogger<GlobalExceptionMiddleware>.Instance);

        await middleware.InvokeAsync(context);

        context.Response.Body.Position = 0;
        using var document = await JsonDocument.ParseAsync(context.Response.Body);
        return (context.Response.StatusCode, document.RootElement.Clone());
    }

    [Fact]
    public async Task PatientNotFound_Returns404_WithMessage()
    {
        var (statusCode, body) = await InvokeAsync(_ => throw new PatientNotFoundException(42));

        Assert.Equal(StatusCodes.Status404NotFound, statusCode);
        Assert.Equal("Patient with id 42 was not found.", body.GetProperty("message").GetString());
    }

    [Fact]
    public async Task DuplicatePatient_Returns409_WithMessage()
    {
        var (statusCode, body) = await InvokeAsync(_ => throw new DuplicatePatientException("DNI", "30123456"));

        Assert.Equal(StatusCodes.Status409Conflict, statusCode);
        Assert.Contains("already exists", body.GetProperty("message").GetString());
    }

    [Fact]
    public async Task ValidationException_Returns400_WithDetails()
    {
        var validation = new ValidationException(new[]
        {
            new ValidationFailure("DocumentNumber", "DocumentNumber must not be empty."),
            new ValidationFailure("FirstName", "FirstName must not be empty.")
        });

        var (statusCode, body) = await InvokeAsync(_ => throw validation);

        Assert.Equal(StatusCodes.Status400BadRequest, statusCode);
        Assert.Equal("Validation failed.", body.GetProperty("message").GetString());
        Assert.Equal(2, body.GetProperty("details").GetArrayLength());
    }

    [Fact]
    public async Task UnexpectedException_Returns500_WithGenericMessage()
    {
        var (statusCode, body) = await InvokeAsync(_ => throw new InvalidOperationException("boom"));

        Assert.Equal(StatusCodes.Status500InternalServerError, statusCode);
        Assert.Equal("An unexpected error occurred.", body.GetProperty("message").GetString());
    }
}