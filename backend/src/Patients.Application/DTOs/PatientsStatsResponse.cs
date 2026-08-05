namespace Patients.Application.DTOs;

public record MonthlyPatientCount(string Month, int Count);

public record PatientsStatsResponse(
    int TotalPatients,
    int CreatedLast30Days,
    IReadOnlyList<MonthlyPatientCount> ByMonth);
