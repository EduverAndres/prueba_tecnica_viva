using Patients.Domain.Entities;

namespace Patients.Application.Interfaces;

public interface IPatientRepository
{
    Task<Patient?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(string documentType, string documentNumber, int? excludePatientId = null, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<Patient> Items, int Total)> GetPagedAsync(int page, int pageSize, string? name, string? documentNumber, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Patient>> GetCreatedAfterAsync(DateTime createdAfter, CancellationToken cancellationToken = default);

    Task<(int Total, int Last30Days, IReadOnlyList<(int Year, int Month, int Count)> ByMonth)> GetStatsAsync(CancellationToken cancellationToken = default);

    Task<Patient> AddAsync(Patient patient, CancellationToken cancellationToken = default);

    void Update(Patient patient);

    void Remove(Patient patient);

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
