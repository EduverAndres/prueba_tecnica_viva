namespace Patients.Api.DTOs;

public record ApiError(string Message, string[]? Details = null);
