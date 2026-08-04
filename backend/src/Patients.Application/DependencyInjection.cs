using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Patients.Application.Interfaces;
using Patients.Application.Services;

namespace Patients.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        services.AddScoped<IPatientService, PatientService>();
        return services;
    }
}
