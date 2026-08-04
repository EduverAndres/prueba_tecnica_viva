namespace Patients.Application.DTOs;

public record PagedResult<T>(
    IReadOnlyList<T> Data,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages);
