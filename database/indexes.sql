-- ============================================================
-- Suggested indexes — Patients table
-- Justification for each index:
--
-- 1. IX_Patients_LastName_FirstName
--    Supports the patient list ORDER BY (LastName, FirstName)
--    and the contains search on both name columns used by
--    sp_SearchPatients / PatientRepository.GetPagedAsync.
--    A LIKE '%...%' predicate cannot seek, but the index still
--    removes the need for an explicit sort and helps prefix
--    searches (LIKE 'Mar%').
--
-- 2. IX_Patients_CreatedAt
--    Supports:
--      - the monthly statistics query (COUNT/GROUP BY CreatedAt)
--      - the "created after" report (sp_GetPatientsCreatedAfter
--        filters and orders by CreatedAt)
--      - dashboard KPIs (created in the last 30 days)
--    Without it, every stats/report call scans the whole table.
--
-- 3. IX_Patients_DocumentNumber
--    Supports the exact-match document filter in
--    sp_SearchPatients / GetPagedAsync when searching by
--    document number alone. The UNIQUE constraint
--    UX_Patients_Document only covers (DocumentType,
--    DocumentNumber) as a composite, so a lone DocumentNumber
--    predicate cannot use it efficiently.
--
-- PK_Patients (clustered) and UX_Patients_Document remain the
-- primary key / uniqueness enforcement.
--
-- Safe to re-run (guarded creation).
-- ============================================================

USE PatientsDB;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Patients_LastName_FirstName' AND object_id = OBJECT_ID(N'dbo.Patients'))
BEGIN
    CREATE INDEX IX_Patients_LastName_FirstName
        ON dbo.Patients (LastName, FirstName);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Patients_CreatedAt' AND object_id = OBJECT_ID(N'dbo.Patients'))
BEGIN
    CREATE INDEX IX_Patients_CreatedAt
        ON dbo.Patients (CreatedAt);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Patients_DocumentNumber' AND object_id = OBJECT_ID(N'dbo.Patients'))
BEGIN
    CREATE INDEX IX_Patients_DocumentNumber
        ON dbo.Patients (DocumentNumber);
END
GO

-- Preview the resulting index set:
SELECT i.name, i.type_desc, i.is_unique,
       STRING_AGG(c.name, ', ') WITHIN GROUP (ORDER BY ic.key_ordinal) AS columns
FROM sys.indexes AS i
JOIN sys.index_columns AS ic ON ic.object_id = i.object_id AND ic.index_id = i.index_id
JOIN sys.columns AS c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
WHERE i.object_id = OBJECT_ID(N'dbo.Patients')
GROUP BY i.name, i.type_desc, i.is_unique
ORDER BY i.name;
GO
