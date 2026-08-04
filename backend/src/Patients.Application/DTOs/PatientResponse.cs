using Patients.Domain.Entities;

namespace Patients.Application.DTOs;

public record PatientResponse(
    int PatientId,
    string DocumentType,
    string DocumentNumber,
    string FirstName,
    string LastName,
    DateTime BirthDate,
    string? PhoneNumber,
    string? Email,
    DateTime CreatedAt)
{
    public static PatientResponse FromEntity(Patient patient) =>
        new(
            patient.PatientId,
            patient.DocumentType,
            patient.DocumentNumber,
            patient.FirstName,
            patient.LastName,
            patient.BirthDate,
            patient.PhoneNumber,
            patient.Email,
            patient.CreatedAt);
}
