using Microsoft.AspNetCore.Mvc;
using Patients.Api.DTOs;
using Patients.Application.DTOs;
using Patients.Application.Interfaces;

namespace Patients.Api.Controllers;

[ApiController]
[Route("api/patients")]
public class PatientsController : ControllerBase
{
    private readonly IPatientService _service;

    public PatientsController(IPatientService service)
    {
        _service = service;
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(PatientResponse))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiError))]
    [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(ApiError))]
    public async Task<ActionResult<PatientResponse>> Create([FromBody] CreatePatientRequest request, CancellationToken cancellationToken)
    {
        var patient = await _service.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = patient.PatientId }, patient);
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PagedResult<PatientResponse>))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiError))]
    public async Task<ActionResult<PagedResult<PatientResponse>>> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? name = null,
        [FromQuery] string? documentNumber = null,
        CancellationToken cancellationToken = default)
    {
        if (page < 1)
        {
            return BadRequest(new ApiError("Invalid pagination parameters.", ["page must be greater than or equal to 1."]));
        }

        if (pageSize is < 1 or > 100)
        {
            return BadRequest(new ApiError("Invalid pagination parameters.", ["pageSize must be between 1 and 100."]));
        }

        return Ok(await _service.GetPagedAsync(page, pageSize, name, documentNumber, cancellationToken));
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PatientResponse))]
    [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiError))]
    public async Task<ActionResult<PatientResponse>> GetById([FromRoute] int id, CancellationToken cancellationToken)
    {
        var patient = await _service.GetByIdAsync(id, cancellationToken);
        return patient is null ? NotFound() : Ok(patient);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PatientResponse))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiError))]
    [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiError))]
    [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(ApiError))]
    public async Task<ActionResult<PatientResponse>> Update([FromRoute] int id, [FromBody] UpdatePatientRequest request, CancellationToken cancellationToken)
    {
        var patient = await _service.UpdateAsync(id, request, cancellationToken);
        return Ok(patient);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiError))]
    public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken cancellationToken)
    {
        await _service.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpGet("created-after")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IReadOnlyList<PatientResponse>))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiError))]
    public async Task<ActionResult<IReadOnlyList<PatientResponse>>> GetCreatedAfter([FromQuery] DateTime? from, CancellationToken cancellationToken)
    {
        if (from is null)
        {
            return BadRequest(new ApiError("Missing query parameter.", ["'from' is required, e.g. /api/patients/created-after?from=2024-01-01."]));
        }

        // Treat date-only values as UTC so the comparison against the
        // stored UTC timestamps is well defined.
        var utcFrom = from.Value.Kind == DateTimeKind.Utc
            ? from.Value
            : DateTime.SpecifyKind(from.Value, DateTimeKind.Utc);

        return Ok(await _service.GetCreatedAfterAsync(utcFrom, cancellationToken));
    }

    [HttpGet("stats")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PatientsStatsResponse))]
    public async Task<ActionResult<PatientsStatsResponse>> GetStats(CancellationToken cancellationToken)
    {
        return Ok(await _service.GetStatsAsync(cancellationToken));
    }
}
