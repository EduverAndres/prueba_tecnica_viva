-- ============================================================
-- Stored procedure: dbo.sp_SearchPatients
-- Paginated search over patients with optional filters.
-- Mirrors the behavior of PatientRepository.GetPagedAsync:
--   - @Name: case-insensitive contains match on FirstName/LastName
--     (LIKE wildcards % _ [ are escaped so user input is literal)
--   - @DocumentNumber: exact match
-- Returns TWO result sets:
--   1) COUNT_BIG(*) of matching rows (total for pagination)
--   2) The requested page ordered by LastName, FirstName
-- Uses OFFSET/FETCH (SQL Server 2012+) for efficient paging.
-- Safe to re-run (idempotent guard + CREATE OR ALTER).
-- ============================================================

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

    -- Sanitize pagination inputs.
    SET @Page     = CASE WHEN @Page < 1 THEN 1 ELSE @Page END;
    SET @PageSize = CASE WHEN @PageSize < 1 OR @PageSize > 100 THEN 10 ELSE @PageSize END;

    DECLARE @Offset INT = (@Page - 1) * @PageSize;
    DECLARE @Pattern NVARCHAR(161) = NULL;

    -- Escape LIKE wildcards so the filter behaves as a literal contains search.
    IF @Name IS NOT NULL AND LTRIM(RTRIM(@Name)) <> N''
    BEGIN
        SET @Pattern = N'%' + REPLACE(REPLACE(REPLACE(LTRIM(RTRIM(@Name)), N'[', N'[[]'), N'%', N'[%]'), N'_', N'[_]') + N'%';
    END

    -- Result set 1: total matching rows (drives client pagination).
    SELECT COUNT_BIG(*) AS Total
    FROM dbo.Patients AS p
    WHERE (@Pattern IS NULL OR p.FirstName LIKE @Pattern OR p.LastName LIKE @Pattern)
      AND (@DocumentNumber IS NULL OR p.DocumentNumber = @DocumentNumber);

    -- Result set 2: requested page.
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
