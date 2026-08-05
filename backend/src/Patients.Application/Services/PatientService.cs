using FluentValidation;
using Patients.Application.DTOs;
using Patients.Application.Exceptions;
using Patients.Application.Interfaces;
using Patients.Domain.Entities;

namespace Patients.Application.Services;

public class PatientService : IPatientService
{
    private const int MaxPageSize = 100;

    private readonly IPatientRepository _repository;
    private readonly IValidator<CreatePatientRequest> _createValidator;
    private readonly IValidator<UpdatePatientRequest> _updateValidator;

    public PatientService(
        IPatientRepository repository,
        IValidator<CreatePatientRequest> createValidator,
        IValidator<UpdatePatientRequest> updateValidator)
    {
        _repository = repository;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    public async Task<PatientResponse> CreateAsync(CreatePatientRequest request, CancellationToken cancellationToken = default)
    {
        await _createValidator.ValidateAndThrowAsync(request, cancellationToken);

        await EnsureDocumentIsUniqueAsync(request.DocumentType, request.DocumentNumber, null, cancellationToken);

        var patient = new Patient
        {
            DocumentType = request.DocumentType.Trim(),
            DocumentNumber = request.DocumentNumber.Trim(),
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            BirthDate = request.BirthDate,
            PhoneNumber = request.PhoneNumber?.Trim(),
            Email = request.Email?.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(patient, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        return PatientResponse.FromEntity(patient);
    }

    public async Task<PagedResult<PatientResponse>> GetPagedAsync(int page, int pageSize, string? name, string? documentNumber, CancellationToken cancellationToken = default)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, MaxPageSize);

        var (items, total) = await _repository.GetPagedAsync(page, pageSize, name, documentNumber, cancellationToken);
        var totalPages = (int)Math.Ceiling(total / (double)pageSize);

        return new PagedResult<PatientResponse>(
            items.Select(PatientResponse.FromEntity).ToList(),
            total,
            page,
            pageSize,
            totalPages);
    }

    public async Task<PatientResponse?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var patient = await _repository.GetByIdAsync(id, cancellationToken);
        return patient is null ? null : PatientResponse.FromEntity(patient);
    }

    public async Task<PatientResponse> UpdateAsync(int id, UpdatePatientRequest request, CancellationToken cancellationToken = default)
    {
        await _updateValidator.ValidateAndThrowAsync(request, cancellationToken);

        var patient = await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new PatientNotFoundException(id);

        await EnsureDocumentIsUniqueAsync(request.DocumentType, request.DocumentNumber, id, cancellationToken);

        patient.DocumentType = request.DocumentType.Trim();
        patient.DocumentNumber = request.DocumentNumber.Trim();
        patient.FirstName = request.FirstName.Trim();
        patient.LastName = request.LastName.Trim();
        patient.BirthDate = request.BirthDate;
        patient.PhoneNumber = request.PhoneNumber?.Trim();
        patient.Email = request.Email?.Trim();

        _repository.Update(patient);
        await _repository.SaveChangesAsync(cancellationToken);

        return PatientResponse.FromEntity(patient);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var patient = await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new PatientNotFoundException(id);

        _repository.Remove(patient);
        await _repository.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PatientResponse>> GetCreatedAfterAsync(DateTime createdAfter, CancellationToken cancellationToken = default)
    {
        var patients = await _repository.GetCreatedAfterAsync(createdAfter, cancellationToken);
        return patients.Select(PatientResponse.FromEntity).ToList();
    }

    public async Task<PatientsStatsResponse> GetStatsAsync(CancellationToken cancellationToken = default)
    {
        var (total, last30Days, byMonth) = await _repository.GetStatsAsync(cancellationToken);

        // Build the trailing 12-month window (oldest to newest, ending in the
        // current UTC month) and fill missing months with zero so the dashboard
        // chart always renders a complete, stable axis.
        var byMonthLookup = byMonth.ToDictionary(
            x => (x.Year, x.Month),
            x => x.Count);

        var windowStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1).AddMonths(-11);
        var months = Enumerable.Range(0, 12)
            .Select(offset =>
            {
                var month = windowStart.AddMonths(offset);
                return new MonthlyPatientCount(
                    month.ToString("yyyy-MM"),
                    byMonthLookup.GetValueOrDefault((month.Year, month.Month)));
            })
            .ToList();

        return new PatientsStatsResponse(total, last30Days, months);
    }

    private async Task EnsureDocumentIsUniqueAsync(string documentType, string documentNumber, int? excludePatientId, CancellationToken cancellationToken)
    {
        if (await _repository.ExistsAsync(documentType, documentNumber, excludePatientId, cancellationToken))
        {
            throw new DuplicatePatientException(documentType, documentNumber);
        }
    }
}
