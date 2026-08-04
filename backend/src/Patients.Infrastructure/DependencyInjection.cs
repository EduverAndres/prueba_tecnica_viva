using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Patients.Application.Interfaces;
using Patients.Infrastructure.Persistence;

namespace Patients.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("PatientsDb");
        services.AddDbContext<PatientsDbContext>(options => options.UseSqlServer(connectionString));
        services.AddScoped<IPatientRepository, PatientRepository>();
        return services;
    }
}
