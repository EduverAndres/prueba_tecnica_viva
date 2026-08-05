-- ============================================================
-- Scalar function: dbo.fn_GetPatientAge
-- Returns the patient's age in whole years on the current UTC
-- date, computed from BirthDate. Returns NULL for NULL birth
-- dates or future birth dates.
-- Usage examples:
--   SELECT dbo.fn_GetPatientAge(p.BirthDate) FROM dbo.Patients AS p;
-- Safe to re-run (idempotent guard + CREATE OR ALTER).
-- ============================================================

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

    -- Reject future birth dates (data quality guard).
    IF @BirthDate > @Today
        RETURN NULL;

    DECLARE @Years INT = DATEDIFF(YEAR, @BirthDate, @Today);

    -- Subtract one year when the birthday has not happened yet this year.
    IF DATEADD(YEAR, @Years, @BirthDate) > @Today
        SET @Years = @Years - 1;

    RETURN @Years;
END
GO
