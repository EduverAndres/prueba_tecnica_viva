using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Patients.Application.Exceptions;
using Patients.Application.Interfaces;
using Patients.Domain.Entities;
using Patients.Infrastructure.Persistence;

namespace Patients.Infrastructure.Persistence;

public class PatientRepository : IPatientRepository
{
    private const string GetCreatedAfterProcedure = "EXEC dbo.sp_GetPatientsCreatedAfter @CreatedAfter = {0}";

    private readonly PatientsDbContext _context;

    public PatientRepository(PatientsDbContext context)
    {
        _context = context;
    }

    public async Task<Patient?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Patients
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.PatientId == id, cancellationToken);
    }

    public async Task<bool> ExistsAsync(string documentType, string documentNumber, int? excludePatientId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Patients
            .AsNoTracking()
            .Where(p => p.DocumentType == documentType && p.DocumentNumber == documentNumber);

        if (excludePatientId.HasValue)
        {
            query = query.Where(p => p.PatientId != excludePatientId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<Patient> Items, int Total)> GetPagedAsync(int page, int pageSize, string? name, string? documentNumber, CancellationToken cancellationToken = default)
    {
        var query = _context.Patients.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(name))
        {
            query = query.Where(p => p.FirstName.Contains(name) || p.LastName.Contains(name));
        }

        if (!string.IsNullOrWhiteSpace(documentNumber))
        {
            query = query.Where(p => p.DocumentNumber == documentNumber);
        }

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(p => p.LastName).ThenBy(p => p.FirstName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, total);
    }

    public async Task<IReadOnlyList<Patient>> GetCreatedAfterAsync(DateTime createdAfter, CancellationToken cancellationToken = default)
    {
        return await _context.Patients
            .FromSqlRaw(GetCreatedAfterProcedure, createdAfter)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<(int Total, int Last30Days, IReadOnlyList<(int Year, int Month, int Count)> ByMonth)> GetStatsAsync(CancellationToken cancellationToken = default)
    {
        var total = await _context.Patients.CountAsync(cancellationToken);

        var last30Days = await _context.Patients
            .CountAsync(p => p.CreatedAt >= DateTime.UtcNow.AddDays(-30), cancellationToken);

        var byMonth = await _context.Patients
            .AsNoTracking()
            .Where(p => p.CreatedAt >= DateTime.UtcNow.AddYears(-1))
            .GroupBy(p => new { p.CreatedAt.Year, p.CreatedAt.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
            .OrderBy(x => x.Year).ThenBy(x => x.Month)
            .ToListAsync(cancellationToken);

        return (total, last30Days, byMonth
            .Select(x => (x.Year, x.Month, x.Count))
            .ToList());
    }

    public async Task<Patient> AddAsync(Patient patient, CancellationToken cancellationToken = default)
    {
        var entry = await _context.Patients.AddAsync(patient, cancellationToken);
        return entry.Entity;
    }

    public void Update(Patient patient)
    {
        _context.Patients.Update(patient);
    }

    public void Remove(Patient patient)
    {
        _context.Patients.Remove(patient);
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (IsUniqueConstraintViolation(ex))
        {
            // Backstop for races: the service checks duplicates first, but the
            // database UNIQUE constraint is the final authority.
            throw new DuplicatePatientException("A patient with the same document type and number already exists.");
        }
    }

    private static bool IsUniqueConstraintViolation(DbUpdateException exception)
    {
        return exception.GetBaseException() is SqlException { Number: 2601 or 2627 };
    }
}
