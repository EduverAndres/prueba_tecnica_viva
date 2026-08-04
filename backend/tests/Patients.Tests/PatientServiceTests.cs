using Microsoft.EntityFrameworkCore;
using Patients.Application.DTOs;
using Patients.Application.Exceptions;
using Patients.Application.Interfaces;
using Patients.Application.Services;
using Patients.Domain.Entities;
using Patients.Infrastructure.Persistence;

namespace Patients.Tests;

public class PatientServiceTests
{
    private static PatientsDbContext CreateContext(string? databaseName = null)
    {
        var options = new DbContextOptionsBuilder<PatientsDbContext>()
            .UseInMemoryDatabase(databaseName ?? Guid.NewGuid().ToString())
            .Options;
        return new PatientsDbContext(options);
    }

    private static PatientService CreateService(PatientsDbContext context)
    {
        return new PatientService(new PatientRepository(context));
    }

    private static CreatePatientRequest ValidRequest => new(
        "DNI", "30123456", "María", "González", new DateTime(1988, 3, 14), "+54 11 5555-0101", "maria@example.com");

    [Fact]
    public async Task CreateAsync_ReturnsResponse_WithGeneratedIdAndCreatedAt()
    {
        var context = CreateContext();
        var service = CreateService(context);

        var result = await service.CreateAsync(ValidRequest);

        Assert.True(result.PatientId > 0);
        Assert.Equal("DNI", result.DocumentType);
        Assert.Equal("30123456", result.DocumentNumber);
        Assert.Equal("María", result.FirstName);
        Assert.True((DateTime.UtcNow - result.CreatedAt).Duration() < TimeSpan.FromSeconds(5));
        Assert.Single(context.Patients);
    }

    [Fact]
    public async Task CreateAsync_WhenDocumentAlreadyExists_ThrowsDuplicatePatientException()
    {
        var context = CreateContext();
        var service = CreateService(context);

        await service.CreateAsync(ValidRequest);

        await Assert.ThrowsAsync<DuplicatePatientException>(() =>
            service.CreateAsync(ValidRequest with { Email = "other@example.com" }));
    }

    [Fact]
    public async Task GetPagedAsync_AppliesNameFilter_AndReturnsPagingMetadata()
    {
        var context = CreateContext();
        SeedPatients(context);
        var service = CreateService(context);

        var result = await service.GetPagedAsync(page: 1, pageSize: 2, name: "Juan", documentNumber: null);

        // TotalCount reflects the filtered set, not the whole table.
        Assert.Equal(2, result.TotalCount);
        Assert.Equal(2, result.Data.Count);
        Assert.Equal(1, result.TotalPages);
        Assert.Equal(1, result.Page);
        Assert.Equal(2, result.PageSize);
        Assert.All(result.Data, p => Assert.Contains("juan", (p.FirstName + " " + p.LastName).ToLowerInvariant()));
    }

    [Fact]
    public async Task GetPagedAsync_ReturnsAll_PagesAcrossTheWholeTable()
    {
        var context = CreateContext();
        SeedPatients(context);
        var service = CreateService(context);

        var firstPage = await service.GetPagedAsync(page: 1, pageSize: 2, name: null, documentNumber: null);
        var secondPage = await service.GetPagedAsync(page: 2, pageSize: 2, name: null, documentNumber: null);

        Assert.Equal(5, firstPage.TotalCount);
        Assert.Equal(2, firstPage.Data.Count);
        Assert.Equal(3, firstPage.TotalPages);
        Assert.Equal(2, secondPage.Data.Count);
        Assert.DoesNotContain(secondPage.Data, p => p.PatientId == firstPage.Data[0].PatientId);
        Assert.DoesNotContain(secondPage.Data, p => p.PatientId == firstPage.Data[1].PatientId);
    }

    [Fact]
    public async Task GetPagedAsync_AppliesExactDocumentNumberFilter()
    {
        var context = CreateContext();
        SeedPatients(context);
        var service = CreateService(context);

        var result = await service.GetPagedAsync(page: 1, pageSize: 10, name: null, documentNumber: "32109876");

        Assert.Equal(1, result.TotalCount);
        Assert.Equal("Juan", result.Data[0].FirstName);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenPatientDoesNotExist()
    {
        var service = CreateService(CreateContext());

        var result = await service.GetByIdAsync(999);

        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateAsync_UpdatesFields_AndAllowsKeepingSameDocument()
    {
        // Seed through a separate context so the service context starts with a
        // clean change tracker, mirroring a scoped DbContext per request.
        var databaseName = Guid.NewGuid().ToString();
        var seedContext = CreateContext(databaseName);
        var patient = SeedPatient(seedContext, "DNI", "30123456");

        var context = CreateContext(databaseName);
        var service = CreateService(context);

        var request = new UpdatePatientRequest("DNI", "30123456", "María", "Gómez", new DateTime(1988, 3, 14), null, "maria.gomez@example.com");

        var result = await service.UpdateAsync(patient.PatientId, request);

        Assert.Equal("Gómez", result.LastName);
        Assert.Equal("maria.gomez@example.com", result.Email);
    }

    [Fact]
    public async Task UpdateAsync_ThrowsNotFound_WhenPatientDoesNotExist()
    {
        var service = CreateService(CreateContext());

        var request = new UpdatePatientRequest("DNI", "30123456", "María", "González", new DateTime(1988, 3, 14), null, null);

        await Assert.ThrowsAsync<PatientNotFoundException>(() =>
            service.UpdateAsync(999, request));
    }

    [Fact]
    public async Task UpdateAsync_ThrowsDuplicate_WhenAnotherPatientUsesTheDocument()
    {
        var context = CreateContext();
        SeedPatients(context);
        var service = CreateService(context);
        var first = context.Patients.OrderBy(p => p.PatientId).First();

        var request = new UpdatePatientRequest("DNI", "32109876", "María", "González", new DateTime(1988, 3, 14), null, null);

        await Assert.ThrowsAsync<DuplicatePatientException>(() =>
            service.UpdateAsync(first.PatientId, request));
    }

    [Fact]
    public async Task DeleteAsync_RemovesPatient_WhenItExists()
    {
        var databaseName = Guid.NewGuid().ToString();
        var seedContext = CreateContext(databaseName);
        var patient = SeedPatient(seedContext, "DNI", "30123456");

        var context = CreateContext(databaseName);
        var service = CreateService(context);

        await service.DeleteAsync(patient.PatientId);

        Assert.Empty(context.Patients);
    }

    [Fact]
    public async Task DeleteAsync_ThrowsNotFound_WhenPatientDoesNotExist()
    {
        var service = CreateService(CreateContext());

        await Assert.ThrowsAsync<PatientNotFoundException>(() =>
            service.DeleteAsync(999));
    }

    private static void SeedPatients(PatientsDbContext context)
    {
        context.Patients.AddRange(
            new Patient { DocumentType = "DNI", DocumentNumber = "30123456", FirstName = "María", LastName = "González", BirthDate = new DateTime(1988, 3, 14), CreatedAt = DateTime.UtcNow },
            new Patient { DocumentType = "DNI", DocumentNumber = "32109876", FirstName = "Juan", LastName = "Pérez", BirthDate = new DateTime(1975, 11, 2), CreatedAt = DateTime.UtcNow },
            new Patient { DocumentType = "PAS", DocumentNumber = "AA1234567", FirstName = "Carlos", LastName = "Rodríguez", BirthDate = new DateTime(1990, 7, 21), CreatedAt = DateTime.UtcNow },
            new Patient { DocumentType = "DNI", DocumentNumber = "38900123", FirstName = "Ana", LastName = "Martínez", BirthDate = new DateTime(2001, 1, 30), CreatedAt = DateTime.UtcNow },
            new Patient { DocumentType = "DNI", DocumentNumber = "41234567", FirstName = "Juana", LastName = "Ramírez", BirthDate = new DateTime(1995, 9, 9), CreatedAt = DateTime.UtcNow });
        context.SaveChanges();
    }

    private static Patient SeedPatient(PatientsDbContext context, string documentType, string documentNumber)
    {
        var patient = new Patient
        {
            DocumentType = documentType,
            DocumentNumber = documentNumber,
            FirstName = "María",
            LastName = "González",
            BirthDate = new DateTime(1988, 3, 14),
            CreatedAt = DateTime.UtcNow
        };
        context.Patients.Add(patient);
        context.SaveChanges();
        return patient;
    }
}