using Microsoft.AspNetCore.Mvc;
using Moq;
using Patients.Api.Controllers;
using Patients.Api.DTOs;
using Patients.Application.DTOs;
using Patients.Application.Interfaces;

namespace Patients.Tests;

public class PatientsControllerTests
{
    private static readonly PatientResponse Patient = new(
        1, "DNI", "30123456", "María", "González", new DateTime(1988, 3, 14), "+54 11 5555-0101", "maria@example.com", DateTime.UtcNow);

    [Fact]
    public async Task Create_ReturnsCreatedAtAction_WithLocationHeader()
    {
        var service = new Mock<IPatientService>();
        service.Setup(s => s.CreateAsync(It.IsAny<CreatePatientRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Patient);
        var controller = new PatientsController(service.Object);

        var result = await controller.Create(new CreatePatientRequest("DNI", "30123456", "María", "González", new DateTime(1988, 3, 14), null, null), CancellationToken.None);

        var actionResult = Assert.IsType<CreatedAtActionResult>(result.Result!);
        Assert.Equal("GetById", actionResult.ActionName);
        Assert.Equal(1, actionResult.RouteValues["id"]);
        Assert.Equal(Patient, actionResult.Value);
    }

    [Fact]
    public async Task GetPaged_ReturnsOk_WithPagedResult()
    {
        var paged = new PagedResult<PatientResponse>([Patient], 1, 1, 10, 1);
        var service = new Mock<IPatientService>();
        service.Setup(s => s.GetPagedAsync(1, 10, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(paged);
        var controller = new PatientsController(service.Object);

        var result = await controller.GetPaged(page: 1, pageSize: 10, name: null, documentNumber: null, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Same(paged, ok.Value);
    }

    [Fact]
    public async Task GetPaged_WithInvalidPage_ReturnsBadRequest()
    {
        var controller = new PatientsController(Mock.Of<IPatientService>());

        var result = await controller.GetPaged(page: 0, pageSize: 10, name: null, documentNumber: null, CancellationToken.None);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        var error = Assert.IsType<ApiError>(badRequest.Value);
        Assert.Equal("Invalid pagination parameters.", error.Message);
        Assert.NotNull(error.Details);
    }

    [Fact]
    public async Task GetById_ReturnsOk_WhenPatientExists()
    {
        var service = new Mock<IPatientService>();
        service.Setup(s => s.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Patient);
        var controller = new PatientsController(service.Object);

        var result = await controller.GetById(1, CancellationToken.None);

        Assert.Equal(Patient, Assert.IsType<OkObjectResult>(result.Result).Value);
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_WhenPatientDoesNotExist()
    {
        var service = new Mock<IPatientService>();
        service.Setup(s => s.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PatientResponse?)null);
        var controller = new PatientsController(service.Object);

        var result = await controller.GetById(999, CancellationToken.None);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Update_ReturnsOk_WithUpdatedPatient()
    {
        var updated = Patient with { LastName = "Gómez" };
        var service = new Mock<IPatientService>();
        service.Setup(s => s.UpdateAsync(1, It.IsAny<UpdatePatientRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(updated);
        var controller = new PatientsController(service.Object);

        var result = await controller.Update(1, new UpdatePatientRequest("DNI", "30123456", "María", "Gómez", new DateTime(1988, 3, 14), null, null), CancellationToken.None);

        Assert.Equal(updated, Assert.IsType<OkObjectResult>(result.Result).Value);
    }

    [Fact]
    public async Task Delete_ReturnsNoContent_WhenPatientExists()
    {
        var service = new Mock<IPatientService>();
        var controller = new PatientsController(service.Object);

        var result = await controller.Delete(1, CancellationToken.None);

        Assert.IsType<NoContentResult>(result);
        service.Verify(s => s.DeleteAsync(1, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetCreatedAfter_ReturnsOk_WithPatients()
    {
        var since = new DateTime(2024, 1, 1);
        var service = new Mock<IPatientService>();
        service.Setup(s => s.GetCreatedAfterAsync(since, It.IsAny<CancellationToken>()))
            .ReturnsAsync([Patient]);
        var controller = new PatientsController(service.Object);

        var result = await controller.GetCreatedAfter(since, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var patients = Assert.IsAssignableFrom<IReadOnlyList<PatientResponse>>(ok.Value);
        Assert.Single(patients);
    }

    [Fact]
    public async Task GetCreatedAfter_WithoutFrom_ReturnsBadRequest()
    {
        var controller = new PatientsController(Mock.Of<IPatientService>());

        var result = await controller.GetCreatedAfter(null, CancellationToken.None);

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }
}