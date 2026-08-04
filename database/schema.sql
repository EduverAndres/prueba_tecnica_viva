-- ============================================================
-- Patients database schema
-- SQL Server (>= 2019 recommended)
-- Creates: database, Patients table, UNIQUE constraint on
-- (DocumentType, DocumentNumber) and stored procedure.
-- Safe to re-run (idempotent guards on every object).
-- ============================================================

IF DB_ID(N'PatientsDB') IS NULL
BEGIN
    CREATE DATABASE PatientsDB;
END
GO

USE PatientsDB;
GO

IF OBJECT_ID(N'dbo.Patients', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Patients
    (
        PatientId      INT IDENTITY(1,1) NOT NULL
                       CONSTRAINT PK_Patients PRIMARY KEY,
        DocumentType   NVARCHAR(10)  NOT NULL,
        DocumentNumber NVARCHAR(20)  NOT NULL,
        FirstName      NVARCHAR(80)  NOT NULL,
        LastName       NVARCHAR(80)  NOT NULL,
        BirthDate      DATE          NOT NULL,
        PhoneNumber    NVARCHAR(20)  NULL,
        Email          NVARCHAR(120) NULL,
        CreatedAt      DATETIME2     NOT NULL
                       CONSTRAINT DF_Patients_CreatedAt DEFAULT (SYSUTCDATETIME())
    );

    -- Business rule: a document (type + number) identifies one patient.
    ALTER TABLE dbo.Patients
        ADD CONSTRAINT UX_Patients_Document UNIQUE (DocumentType, DocumentNumber);
END
GO
