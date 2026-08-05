using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Patients.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDatabaseOptimizations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Patients_CreatedAt",
                table: "Patients",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Patients_DocumentNumber",
                table: "Patients",
                column: "DocumentNumber");

            migrationBuilder.CreateIndex(
                name: "IX_Patients_LastName_FirstName",
                table: "Patients",
                columns: new[] { "LastName", "FirstName" });

            // Keeps the stored procedure in sync with /database/sp_SearchPatients.sql
            migrationBuilder.Sql("""
                IF OBJECT_ID(N'dbo.sp_SearchPatients', N'P') IS NULL
                    EXEC(N'CREATE PROCEDURE dbo.sp_SearchPatients AS SELECT 1 AS Placeholder;');
                GO
                ALTER PROCEDURE dbo.sp_SearchPatients
                    @Name           NVARCHAR(80) = NULL,
                    @DocumentNumber NVARCHAR(20) = NULL,
                    @Page           INT = 1,
                    @PageSize       INT = 10
                AS
                BEGIN
                    SET NOCOUNT ON;

                    SET @Page     = CASE WHEN @Page < 1 THEN 1 ELSE @Page END;
                    SET @PageSize = CASE WHEN @PageSize < 1 OR @PageSize > 100 THEN 10 ELSE @PageSize END;

                    DECLARE @Offset INT = (@Page - 1) * @PageSize;
                    DECLARE @Pattern NVARCHAR(161) = NULL;

                    IF @Name IS NOT NULL AND LTRIM(RTRIM(@Name)) <> N''
                    BEGIN
                        SET @Pattern = N'%' + REPLACE(REPLACE(REPLACE(LTRIM(RTRIM(@Name)), N'[', N'[[]'), N'%', N'[%]'), N'_', N'[_]') + N'%';
                    END

                    SELECT COUNT_BIG(*) AS Total
                    FROM dbo.Patients AS p
                    WHERE (@Pattern IS NULL OR p.FirstName LIKE @Pattern OR p.LastName LIKE @Pattern)
                      AND (@DocumentNumber IS NULL OR p.DocumentNumber = @DocumentNumber);

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
                    WHERE (@Pattern IS NULL OR p.FirstName LIKE @Pattern OR p.LastName LIKE @Pattern)
                      AND (@DocumentNumber IS NULL OR p.DocumentNumber = @DocumentNumber)
                    ORDER BY p.LastName ASC, p.FirstName ASC
                    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
                END
                GO
                """);

            // Keeps the function in sync with /database/fn_GetPatientAge.sql
            migrationBuilder.Sql("""
                IF OBJECT_ID(N'dbo.fn_GetPatientAge', N'FN') IS NULL
                    EXEC(N'CREATE FUNCTION dbo.fn_GetPatientAge (@BirthDate DATE) RETURNS INT AS BEGIN RETURN NULL; END;');
                GO
                ALTER FUNCTION dbo.fn_GetPatientAge (@BirthDate DATE)
                RETURNS INT
                AS
                BEGIN
                    IF @BirthDate IS NULL
                        RETURN NULL;

                    DECLARE @Today DATE = CAST(SYSUTCDATETIME() AS DATE);

                    IF @BirthDate > @Today
                        RETURN NULL;

                    DECLARE @Years INT = DATEDIFF(YEAR, @BirthDate, @Today);

                    IF DATEADD(YEAR, @Years, @BirthDate) > @Today
                        SET @Years = @Years - 1;

                    RETURN @Years;
                END
                GO
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Patients_CreatedAt",
                table: "Patients");

            migrationBuilder.DropIndex(
                name: "IX_Patients_DocumentNumber",
                table: "Patients");

            migrationBuilder.DropIndex(
                name: "IX_Patients_LastName_FirstName",
                table: "Patients");

            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS dbo.sp_SearchPatients;");
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS dbo.fn_GetPatientAge;");
        }
    }
}
