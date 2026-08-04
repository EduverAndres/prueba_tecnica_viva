# Patients API — Backend

RESTful API for patient management built with **.NET 8 (LTS)**, **Entity Framework Core 8** and **SQL Server**, exposed with Swagger/OpenAPI and covered by xUnit tests.

## Requirements

- .NET SDK 8.0 (`global.json` at the repo root pins `8.0.423`, roll-forward to the latest feature band)
- SQL Server 2019+ (a local/remote instance; see "Database setup" below)
- `dotnet-ef` CLI (optional, only if you want to run migrations by hand):
  `dotnet tool install --global dotnet-ef`

## Project structure

```
backend/
  Patients.sln
  src/
    Patients.Domain/          Entities (no dependencies)
    Patients.Application/     DTOs, validators (FluentValidation), service layer, repository interface
    Patients.Infrastructure/  EF Core DbContext, repository (incl. stored procedure call), migrations
    Patients.Api/             Controllers, global exception middleware, Swagger, DI composition root
  tests/
    Patients.Tests/           xUnit + Moq + EF Core InMemory
```

Dependency direction: `Api → Application → Domain` and `Api → Infrastructure → Application → Domain`. The API project never touches EF Core or the database directly; everything goes through `IPatientService` and `IPatientRepository`.

## Installation and configuration

```powershell
dotnet restore backend/Patients.sln
```

Set the connection string in `backend/src/Patients.Api/appsettings.json` (or via the `ConnectionStrings__PatientsDb` environment variable):

```json
"ConnectionStrings": {
  "PatientsDb": "Server=localhost;Database=PatientsDB;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

For SQL Server authentication use `User Id=...;Password=...` instead of `Trusted_Connection=True`.

## Database setup

Two equivalent paths are provided; pick one (do not run both against the same database):

**Option A — SQL scripts (Database-First style)**

1. `sqlcmd -S localhost -i database/schema.sql` — creates `PatientsDB`, the `Patients` table, the `UNIQUE` constraint on `(DocumentType, DocumentNumber)` and the default for `CreatedAt` (`SYSUTCDATETIME()`).
2. `sqlcmd -S localhost -i database/sp_GetPatientsCreatedAfter.sql` — creates the stored procedure.
3. `sqlcmd -S localhost -i database/seed.sql` — optional sample data.

**Option B — EF Core migrations (Code-First)**

```powershell
dotnet ef database update --project backend/src/Patients.Infrastructure --startup-project backend/src/Patients.Api
```

The initial migration (`InitialCreate`) creates the same table, the same `UX_Patients_Document` unique index and embeds the stored procedure creation, so `database update` yields an identical schema to Option A. If you later change the EF model, run `dotnet ef migrations add <Name>` and keep `/database/schema.sql` and `sp_GetPatientsCreatedAfter.sql` in sync manually.

The stored procedure `dbo.sp_GetPatientsCreatedAfter (@CreatedAfter DATETIME2)` returns all patients created strictly after the given date, ordered by `CreatedAt`. It is invoked from EF Core with `FromSqlRaw` in `PatientRepository.GetCreatedAfterAsync`.

## Run the API locally

```powershell
dotnet run --project backend/src/Patients.Api
```

- HTTP: http://localhost:5000 — Swagger UI at `/swagger`
- HTTPS: https://localhost:5001

The API starts without a database connection; requests that touch the database will fail until the DB is set up and reachable.

## Run the tests

```powershell
dotnet test backend/Patients.sln
```

Tests use EF Core **InMemory** (service/repository layer) and **Moq** (controllers), so they run without SQL Server.

## Architecture and technical decisions

### Layered architecture

- **Domain** holds the `Patient` entity only. It is a persistence-agnostic model, so business logic never leaks into EF Core.
- **Application** owns the use cases (`PatientService`), the DTOs and FluentValidation validators, and defines `IPatientRepository` (an interface the infrastructure implements). This keeps the API decoupled from storage details and makes the service trivially testable.
- **Infrastructure** implements persistence: `PatientsDbContext`, EF Core configuration, the repository (including the `FromSqlRaw` call to the stored procedure) and the migrations.
- **Api** is the composition root: controllers, DI wiring, Swagger and the global exception middleware.

Why this split: it gives a single, well-defined seam for testing (`IPatientRepository`), keeps EF Core out of the controllers, and makes the schema definition visible in one place.

### PUT semantics — full (total) update

`PUT /api/patients/{id}` performs a **total replacement** of the editable fields (document, names, birth date, phone, email). This follows HTTP semantics: `PUT` replaces the resource; `PATCH` is the verb for partial updates. The frontend always sends the complete form, so no endpoint for partial updates is exposed.

### Duplicate document validation `(DocumentType, DocumentNumber)`

Two layers defend the business rule:

1. **Application layer** — `PatientService` checks `ExistsAsync` before create/update and throws `DuplicatePatientException`, which the middleware maps to **409 Conflict** with a `message`.
2. **Database** — the `UX_Patients_Document` unique index is the final authority. `PatientRepository.SaveChangesAsync` detects SQL Server error 2601/2627 (unique constraint violation) and converts it to the same `DuplicatePatientException`, covering concurrent requests (the check-then-insert race).

### Validation

FluentValidation (`CreatePatientValidator`, `UpdatePatientValidator`) validates required fields, max lengths, a non-future `BirthDate`, and the `Email` format. A failed validation produces **400** with `{ message: "Validation failed.", details: [ ... ] }`.

### Consistent error handling

`GlobalExceptionMiddleware` is the single place that converts exceptions into responses:

| Exception | HTTP status | Body |
|---|---|---|
| `PatientNotFoundException` | 404 | `{ message }` |
| `DuplicatePatientException` | 409 | `{ message }` |
| FluentValidation `ValidationException` | 400 | `{ message, details[] }` |
| Anything else | 500 | `{ message: "An unexpected error occurred." }` (logged) |

### CreatedAt

The API sets `CreatedAt = DateTime.UtcNow` in the service so tests and runtime behave identically; the column keeps a `SYSUTCDATETIME()` default for rows inserted outside EF (e.g. `seed.sql`).

### Pagination and filters

`GET /api/patients` supports server-side pagination: `page` (≥ 1), `pageSize` (1–100, default 10), `name` (contains, over `FirstName`/`LastName` — case-insensitive on SQL Server) and `documentNumber` (exact). The response includes `totalCount`, `page`, `pageSize` and `totalPages`, which the Angular frontend uses for its lazy table.

## Endpoints

| Method | Route | Description | Success | Errors |
|---|---|---|---|---|
| POST | `/api/patients` | Create a patient | 201 + patient | 400 validation, 409 duplicate document |
| GET | `/api/patients` | Paged list with `page`, `pageSize`, `name`, `documentNumber` filters | 200 paged result | 400 invalid paging |
| GET | `/api/patients/{id}` | Get one patient | 200 + patient | 404 |
| PUT | `/api/patients/{id}` | Full update | 200 + patient | 400, 404, 409 |
| DELETE | `/api/patients/{id}` | Delete a patient | 204 | 404 |
| GET | `/api/patients/created-after?from=2024-01-01` | Patients created after a date (stored procedure) | 200 list | 400 missing `from` |

Request body example (create/update):

```json
{
  "documentType": "DNI",
  "documentNumber": "30123456",
  "firstName": "María",
  "lastName": "González",
  "birthDate": "1988-03-14",
  "phoneNumber": "+54 11 5555-0101",
  "email": "maria@example.com"
}
```

## Test coverage

- `PatientServiceTests` — create success, duplicate rejection, paging + filters (contains/exact), update (keep own document, not found, duplicate by another patient), delete (success/not found).
- `PatientsControllerTests` — status codes and response shapes for all endpoints (Moq).
- `GlobalExceptionMiddlewareTests` — exception-to-HTTP mapping (404/409/400/500).

The `FromSqlRaw` stored procedure path is covered end-to-end only against a real SQL Server (EF InMemory does not support raw SQL).
