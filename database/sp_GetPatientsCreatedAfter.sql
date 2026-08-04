-- ============================================================
-- sp_GetPatientsCreatedAfter
-- Returns patients whose CreatedAt is strictly after @CreatedAfter.
-- Invoked from EF Core via FromSqlRaw (see PatientRepository).
-- Idempotent: CREATE OR ALTER semantics.
-- ============================================================

USE PatientsDB;
GO

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
