using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Patients.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Patients",
                columns: table => new
                {
                    PatientId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DocumentType = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    DocumentNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    BirthDate = table.Column<DateTime>(type: "date", nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Patients", x => x.PatientId);
                });

            migrationBuilder.CreateIndex(
                name: "UX_Patients_Document",
                table: "Patients",
                columns: new[] { "DocumentType", "DocumentNumber" },
                unique: true);

            // Keeps the stored procedure in sync with /database/sp_GetPatientsCreatedAfter.sql
            migrationBuilder.Sql("""
                IF OBJECT_ID(N'dbo.sp_GetPatientsCreatedAfter', N'P') IS NULL
                    EXEC(N'CREATE PROCEDURE dbo.sp_GetPatientsCreatedAfter AS SELECT 1 AS Placeholder;');
                GO
                ALTER PROCEDURE dbo.sp_GetPatientsCreatedAfter
                    @CreatedAfter DATETIME2
                AS
                BEGIN
                    SET NOCOUNT ON;
                    SELECT
                        p.PatientId,
                        p.DocumentType,
                        p.DocumentNumber,
                        p.FirstName,
                        p.LastName,
                        p.BirthDate,
                        p.PhoneNumber,
                        p.Email,
                        p.CreatedAt
                    FROM dbo.Patients AS p
                    WHERE p.CreatedAt > @CreatedAfter
                    ORDER BY p.CreatedAt ASC;
                END
                GO
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS dbo.sp_GetPatientsCreatedAfter;");

            migrationBuilder.DropTable(
                name: "Patients");
        }
    }
}
