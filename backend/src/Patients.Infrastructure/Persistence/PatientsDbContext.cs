using Microsoft.EntityFrameworkCore;
using Patients.Domain.Entities;

namespace Patients.Infrastructure.Persistence;

public class PatientsDbContext : DbContext
{
    public PatientsDbContext(DbContextOptions<PatientsDbContext> options)
        : base(options) { }

    public DbSet<Patient> Patients => Set<Patient>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new PatientEntityConfiguration());
        base.OnModelCreating(modelBuilder);
    }
}
