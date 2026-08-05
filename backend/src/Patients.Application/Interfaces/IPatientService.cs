using Patients.Application.DTOs;

namespace Patients.Application.Interfaces;

public interface IPatientService
{
    Task<PatientResponse> CreateAsync(CreatePatientRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<PatientResponse>> GetPagedAsync(int page, int pageSize, string? name, string? documentNumber, CancellationToken cancellationToken = default);

    Task<PatientResponse?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<PatientResponse> UpdateAsync(int id, UpdatePatientRequest request, CancellationToken cancellationToken = default);

    Task DeleteAsync(int id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<PatientResponse>> GetCreatedAfterAsync(DateTime createdAfter, CancellationToken cancellationToken = default);

    Task<PatientsStatsResponse> GetStatsAsync(CancellationToken cancellationToken = default);
}
