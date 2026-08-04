using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Patients.Domain.Entities;

namespace Patients.Infrastructure.Persistence;

public class PatientEntityConfiguration : IEntityTypeConfiguration<Patient>
{
    public void Configure(EntityTypeBuilder<Patient> builder)
    {
        builder.ToTable("Patients");

        builder.HasKey(p => p.PatientId);
        builder.Property(p => p.PatientId).ValueGeneratedOnAdd();

        builder.Property(p => p.DocumentType).HasMaxLength(10).IsRequired();
        builder.Property(p => p.DocumentNumber).HasMaxLength(20).IsRequired();
        builder.Property(p => p.FirstName).HasMaxLength(80).IsRequired();
        builder.Property(p => p.LastName).HasMaxLength(80).IsRequired();
        builder.Property(p => p.BirthDate).HasColumnType("date").IsRequired();
        builder.Property(p => p.PhoneNumber).HasMaxLength(20);
        builder.Property(p => p.Email).HasMaxLength(120);
        builder.Property(p => p.CreatedAt).HasColumnType("datetime2").IsRequired();

        // Same constraint name and columns as /database/schema.sql.
        builder.HasIndex(p => new { p.DocumentType, p.DocumentNumber })
            .IsUnique()
            .HasDatabaseName("UX_Patients_Document");
    }
}
