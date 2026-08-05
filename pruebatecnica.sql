USE [PatientsDB];
GO

CREATE TABLE Pacientes (
    PacienteId INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100),
    Documento NVARCHAR(20),
    FechaNacimiento DATE
);

CREATE TABLE Medicos (
    MedicoId INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100),
    Especialidad NVARCHAR(100)
);

CREATE TABLE Consultas (
    ConsultaId INT IDENTITY(1,1) PRIMARY KEY,
    PacienteId INT,
    MedicoId INT,
    FechaConsulta DATETIME,
    Diagnostico NVARCHAR(200),
    ValorConsulta DECIMAL(18,2),
    FOREIGN KEY (PacienteId) REFERENCES Pacientes(PacienteId),
    FOREIGN KEY (MedicoId) REFERENCES Medicos(MedicoId)
);
GO

INSERT INTO Pacientes (Nombre, Documento, FechaNacimiento) VALUES
('Ana Torres',      '10000001', '1988-03-14'),
('Luis Ramírez',    '10000002', '1990-07-22'),
('María Gómez',     '10000003', '1975-11-05'),
('Carlos Pérez',    '10000004', '1995-01-30'),
('Sofía Díaz',      '10000005', '1983-09-18'),
('Jorge Castro',    '10000006', '2000-05-02'),
('Laura Vega',      '10000007', '1978-12-11'),
('Andrés Ruiz',     '10000008', '1992-06-25'),
('Camila Rojas',    '10000009', '1985-02-09'),
('Diego Morales',   '10000010', '1998-08-17'),
('Valentina Cruz',  '10000011', '1991-04-03'),
('Felipe Ortiz',    '10000012', '1980-10-29'),
('Daniela Silva',   '10000013', '1996-03-21'),
('Mateo Herrera',   '10000014', '1987-07-08'),
('Isabella Nuñez',  '10000015', '1993-01-15');

INSERT INTO Medicos (Nombre, Especialidad) VALUES
('Dr. Pedro Gómez',   'Cardiología'),
('Dra. Marta León',   'Pediatría'),
('Dr. Iván Salas',    'Dermatología'),
('Dra. Elena Rey',    'Cardiología'),
('Dr. Tomás Vidal',   'Ortopedia'),
('Dra. Paula Bravo',  'Ginecología');

INSERT INTO Consultas (PacienteId, MedicoId, FechaConsulta, Diagnostico, ValorConsulta) VALUES
(1, 1, DATEADD(DAY, -5,   GETDATE()), 'Control rutinario',        180000),
(1, 4, DATEADD(DAY, -40,  GETDATE()), 'Hipertensión',              210500),
(1, 1, DATEADD(DAY, -90,  GETDATE()), 'Control rutinario',         175000),
(1, 1, DATEADD(DAY, -15,  GETDATE()), 'Chequeo post-tratamiento',  190000),
(1, 4, DATEADD(DAY, -120, GETDATE()), 'Hipertensión',               225000),
(1, 1, DATEADD(DAY, -60,  GETDATE()), 'Control rutinario',          165000),
(2, 2, DATEADD(DAY, -10,  GETDATE()), 'Chequeo pediátrico',         120000),
(2, 3, DATEADD(DAY, -200, GETDATE()), 'Dermatitis',                 140000),
(2, 2, DATEADD(DAY, -25,  GETDATE()), 'Gripe',                      110000),
(3, 1, DATEADD(DAY, -8,   GETDATE()), 'Control rutinario',          185000),
(3, 2, DATEADD(DAY, -18,  GETDATE()), 'Chequeo pediátrico',         115000),
(3, 3, DATEADD(DAY, -22,  GETDATE()), 'Dermatitis',                 145000),
(3, 4, DATEADD(DAY, -45,  GETDATE()), 'Hipertensión',               230000),
(3, 6, DATEADD(DAY, -55,  GETDATE()), 'Revisión post-operatoria',   250000),
(3, 1, DATEADD(DAY, -75,  GETDATE()), 'Control rutinario',          170000),
(4, 2, DATEADD(DAY, -12,  GETDATE()), 'Chequeo pediátrico',         125000),
(5, 3, DATEADD(DAY, -30,  GETDATE()), 'Dermatitis',                 150000),
(5, 3, DATEADD(DAY, -65,  GETDATE()), 'Dermatitis',                 155000),
(5, 3, DATEADD(DAY, -95,  GETDATE()), 'Migraña',                    130000),
(5, 3, DATEADD(DAY, -110, GETDATE()), 'Dermatitis',                 148000),
(6, 1, DATEADD(DAY, -20,  GETDATE()), 'Control rutinario',          178000),
(7, 2, DATEADD(DAY, -14,  GETDATE()), 'Chequeo pediátrico',         118000),
(7, 3, DATEADD(DAY, -35,  GETDATE()), 'Dermatitis',                 142000),
(8, 4, DATEADD(DAY, -50,  GETDATE()), 'Hipertensión',               215000),
(9, 6, DATEADD(DAY, -6,   GETDATE()), 'Revisión post-operatoria',   240000),
(9, 2, DATEADD(DAY, -28,  GETDATE()), 'Chequeo pediátrico',         112000),
(10,1, DATEADD(DAY, -5,   GETDATE()), 'Control rutinario',          182000),
(10,1, DATEADD(DAY, -15,  GETDATE()), 'Control rutinario',          179000),
(10,1, DATEADD(DAY, -40,  GETDATE()), 'Control rutinario',          185000),
(10,1, DATEADD(DAY, -60,  GETDATE()), 'Migraña',                    132000),
(10,1, DATEADD(DAY, -90,  GETDATE()), 'Control rutinario',          176000);
GO

-- 1. Top 5 pacientes con más consultas
SELECT TOP 5
    p.PacienteId,
    p.Nombre,
    COUNT(c.ConsultaId) AS TotalConsultas
FROM Pacientes p
INNER JOIN Consultas c ON c.PacienteId = p.PacienteId
GROUP BY p.PacienteId, p.Nombre
ORDER BY TotalConsultas DESC;

-- 2. Médicos que no han atendido pacientes
SELECT
    m.MedicoId,
    m.Nombre,
    m.Especialidad
FROM Medicos m
LEFT JOIN Consultas c ON c.MedicoId = m.MedicoId
WHERE c.ConsultaId IS NULL;

-- 3. Valor total facturado por médico
SELECT
    m.MedicoId,
    m.Nombre,
    ISNULL(SUM(c.ValorConsulta), 0) AS TotalFacturado
FROM Medicos m
LEFT JOIN Consultas c ON c.MedicoId = m.MedicoId
GROUP BY m.MedicoId, m.Nombre
ORDER BY TotalFacturado DESC;

-- 4. Pacientes atendidos en más de una especialidad
SELECT
    p.PacienteId,
    p.Nombre,
    COUNT(DISTINCT m.Especialidad) AS EspecialidadesDistintas
FROM Pacientes p
INNER JOIN Consultas c ON c.PacienteId = p.PacienteId
INNER JOIN Medicos m ON m.MedicoId = c.MedicoId
GROUP BY p.PacienteId, p.Nombre
HAVING COUNT(DISTINCT m.Especialidad) > 1
ORDER BY EspecialidadesDistintas DESC;

-- 5. Pacientes atendidos en el último mes
SELECT DISTINCT
    p.PacienteId,
    p.Nombre,
    p.Documento
FROM Pacientes p
INNER JOIN Consultas c ON c.PacienteId = p.PacienteId
WHERE c.FechaConsulta >= DATEADD(MONTH, -1, CAST(GETDATE() AS DATE))
ORDER BY p.Nombre;


-- Procedimientos almacenados

CREATE OR ALTER PROCEDURE sp_RegistrarConsulta
    @PacienteId     INT,
    @MedicoId       INT,
    @FechaConsulta  DATETIME = NULL,
    @Diagnostico    NVARCHAR(200),
    @ValorConsulta  DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Pacientes WHERE PacienteId = @PacienteId)
    BEGIN
        RAISERROR('El paciente %d no existe.', 16, 1, @PacienteId);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM Medicos WHERE MedicoId = @MedicoId)
    BEGIN
        RAISERROR('El médico %d no existe.', 16, 1, @MedicoId);
        RETURN;
    END

    IF @ValorConsulta < 0
    BEGIN
        RAISERROR('El valor de la consulta no puede ser negativo.', 16, 1);
        RETURN;
    END

    INSERT INTO Consultas (PacienteId, MedicoId, FechaConsulta, Diagnostico, ValorConsulta)
    VALUES (@PacienteId, @MedicoId, ISNULL(@FechaConsulta, GETDATE()), @Diagnostico, @ValorConsulta);

    SELECT SCOPE_IDENTITY() AS ConsultaId;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerHistorialPaciente
    @PacienteId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Pacientes WHERE PacienteId = @PacienteId)
    BEGIN
        RAISERROR('El paciente %d no existe.', 16, 1, @PacienteId);
        RETURN;
    END

    SELECT
        c.ConsultaId,
        c.FechaConsulta,
        m.Nombre        AS Medico,
        m.Especialidad,
        c.Diagnostico,
        c.ValorConsulta
    FROM Consultas c
    INNER JOIN Medicos m ON m.MedicoId = c.MedicoId
    WHERE c.PacienteId = @PacienteId
    ORDER BY c.FechaConsulta DESC;
END
GO


-- Función

CREATE OR ALTER FUNCTION fn_EdadPaciente (@FechaNacimiento DATE)
RETURNS INT
AS
BEGIN
    DECLARE @Hoy DATE = CAST(GETDATE() AS DATE);
    DECLARE @Edad INT;

    IF @FechaNacimiento IS NULL OR @FechaNacimiento > @Hoy
        RETURN NULL;

    SET @Edad = DATEDIFF(YEAR, @FechaNacimiento, @Hoy);

    IF DATEADD(YEAR, @Edad, @FechaNacimiento) > @Hoy
        SET @Edad = @Edad - 1;

    RETURN @Edad;
END
GO


-- Índices

CREATE NONCLUSTERED INDEX IX_Consultas_PacienteId
ON Consultas (PacienteId)
INCLUDE (MedicoId, FechaConsulta);

CREATE NONCLUSTERED INDEX IX_Consultas_MedicoId
ON Consultas (MedicoId)
INCLUDE (ValorConsulta);

CREATE NONCLUSTERED INDEX IX_Consultas_FechaConsulta
ON Consultas (FechaConsulta);

CREATE NONCLUSTERED INDEX IX_Medicos_Especialidad
ON Medicos (Especialidad);