namespace Patients.Application.DTOs;

public record CreatePatientRequest(
    string DocumentType,
    string DocumentNumber,
    string FirstName,
    string LastName,
    DateTime BirthDate,
    string? PhoneNumber,
    string? Email);
