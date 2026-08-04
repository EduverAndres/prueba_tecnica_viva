namespace Patients.Application.DTOs;

public record UpdatePatientRequest(
    string DocumentType,
    string DocumentNumber,
    string FirstName,
    string LastName,
    DateTime BirthDate,
    string? PhoneNumber,
    string? Email);
