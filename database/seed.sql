-- ============================================================
-- Optional seed data for local development.
-- Runs against PatientsDB; skips rows that already exist
-- (identified by the unique (DocumentType, DocumentNumber)).
-- ============================================================

USE PatientsDB;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Patients WHERE DocumentType = N'DNI' AND DocumentNumber = N'30123456')
BEGIN
    INSERT INTO dbo.Patients (DocumentType, DocumentNumber, FirstName, LastName, BirthDate, PhoneNumber, Email, CreatedAt)
    VALUES
        (N'DNI',  N'30123456', N'María',     N'González',   '1988-03-14', N'+54 11 5555-0101', N'maria.gonzalez@example.com', DATEADD(DAY, -10, SYSUTCDATETIME())),
        (N'DNI',  N'32109876', N'Juan',      N'Pérez',      '1975-11-02', N'+54 11 5555-0102', N'juan.perez@example.com',    DATEADD(DAY, -5,  SYSUTCDATETIME())),
        (N'PAS',  N'AA1234567', N'Carlos',   N'Rodríguez',  '1990-07-21', NULL,              N'carlos.rodriguez@example.com', DATEADD(DAY, -2,  SYSUTCDATETIME())),
        (N'DNI',  N'38900123', N'Ana',       N'Martínez',   '2001-01-30', N'+54 11 5555-0103', NULL,                         SYSUTCDATETIME());
END
GO
