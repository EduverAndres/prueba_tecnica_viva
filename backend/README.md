# Patients API — Backend

API RESTful para la gestión de pacientes construida con **.NET 8 (LTS)**, **Entity Framework Core 8** y **SQL Server**, expuesta con Swagger/OpenAPI y cubierta con pruebas xUnit.

## Requisitos

- .NET SDK 8.0 (`global.json` en la raíz del repositorio fija `8.0.423`, con roll-forward a la banda de características más reciente)
- SQL Server 2019+ (una instancia local o remota; ver "Configuración de la base de datos" más abajo)
- CLI `dotnet-ef` (opcional, solo si se quieren ejecutar las migraciones manualmente):
  `dotnet tool install --global dotnet-ef`

## Estructura del proyecto

```
backend/
  Patients.sln
  src/
    Patients.Domain/          Entidades (sin dependencias)
    Patients.Application/     DTOs, validadores (FluentValidation), capa de servicios, interfaz de repositorio
    Patients.Infrastructure/  DbContext de EF Core, repositorio (incluye llamada al procedimiento almacenado), migraciones
    Patients.Api/             Controladores, middleware global de excepciones, Swagger, composición raíz de DI
  tests/
    Patients.Tests/           xUnit + Moq + EF Core InMemory
```

Dirección de dependencias: `Api → Application → Domain` y `Api → Infrastructure → Application → Domain`. El proyecto de la API nunca toca EF Core ni la base de datos directamente; todo pasa por `IPatientService` e `IPatientRepository`.

## Instalación y configuración

```powershell
dotnet restore backend/Patients.sln
```

Configurar la cadena de conexión en `backend/src/Patients.Api/appsettings.json` (o mediante la variable de entorno `ConnectionStrings__PatientsDb`):

```json
"ConnectionStrings": {
  "PatientsDb": "Server=localhost;Database=PatientsDB;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

Para autenticación de SQL Server usar `User Id=...;Password=...` en lugar de `Trusted_Connection=True`.

## Configuración de la base de datos

Hay dos rutas equivalentes; elija una (no ejecute ambas contra la misma base de datos):

**Opción A — Scripts SQL (estilo Database-First)**

1. `sqlcmd -S localhost -i database/schema.sql` — crea `PatientsDB`, la tabla `Patients`, la restricción `UNIQUE` sobre `(DocumentType, DocumentNumber)` y el valor por defecto de `CreatedAt` (`SYSUTCDATETIME()`).
2. `sqlcmd -S localhost -i database/sp_GetPatientsCreatedAfter.sql` — crea el procedimiento almacenado.
3. `sqlcmd -S localhost -i database/seed.sql` — datos de ejemplo (opcional).

**Opción B — Migraciones de EF Core (Code-First)**

```powershell
dotnet ef database update --project backend/src/Patients.Infrastructure --startup-project backend/src/Patients.Api
```

La migración inicial (`InitialCreate`) crea la misma tabla, el mismo índice único `UX_Patients_Document` e incluye la creación del procedimiento almacenado, de modo que `database update` produce un esquema idéntico al de la Opción A. Si luego se modifica el modelo de EF, ejecutar `dotnet ef migrations add <Nombre>` y mantener en sincronía `/database/schema.sql` y `sp_GetPatientsCreatedAfter.sql` manualmente.

El procedimiento almacenado `dbo.sp_GetPatientsCreatedAfter (@CreatedAfter DATETIME2)` devuelve todos los pacientes creados estrictamente después de la fecha dada, ordenados por `CreatedAt`. Se invoca desde EF Core con `FromSqlRaw` en `PatientRepository.GetCreatedAfterAsync`.

## Ejecutar la API localmente

```powershell
dotnet run --project backend/src/Patients.Api
```

- HTTP: http://localhost:5000 — Swagger UI en `/swagger`
- HTTPS: https://localhost:5001

La API inicia sin conexión a la base de datos; las peticiones que tocan la base de datos fallarán hasta que la BD esté configurada y sea accesible.

## Ejecutar las pruebas

```powershell
dotnet test backend/Patients.sln
```

Las pruebas usan EF Core **InMemory** (capa de servicios/repositorio) y **Moq** (controladores), por lo que se ejecutan sin SQL Server.

## Arquitectura y decisiones técnicas

### Arquitectura por capas

- **Domain** contiene solo la entidad `Patient`. Es un modelo agnóstico de la persistencia, de modo que la lógica de negocio nunca se filtra a EF Core.
- **Application** posee los casos de uso (`PatientService`), los DTOs y los validadores FluentValidation, y define `IPatientRepository` (una interfaz que implementa la infraestructura). Esto mantiene la API desacoplada de los detalles de almacenamiento y hace que el servicio sea trivialmente testeable.
- **Infrastructure** implementa la persistencia: `PatientsDbContext`, configuración de EF Core, el repositorio (incluida la llamada `FromSqlRaw` al procedimiento almacenado) y las migraciones.
- **Api** es la composición raíz: controladores, cableado de DI, Swagger y el middleware global de excepciones.

Por qué esta división: proporciona una única costura bien definida para las pruebas (`IPatientRepository`), mantiene EF Core fuera de los controladores y hace visible la definición del esquema en un solo lugar.

### Semántica de PUT — actualización total

`PUT /api/patients/{id}` realiza un **reemplazo total** de los campos editables (documento, nombres, fecha de nacimiento, teléfono, correo). Esto sigue la semántica HTTP: `PUT` reemplaza el recurso; `PATCH` es el verbo para actualizaciones parciales. El frontend siempre envía el formulario completo, por lo que no se expone ningún endpoint de actualización parcial.

### Validación de documentos duplicados `(DocumentType, DocumentNumber)`

Dos capas defienden la regla de negocio:

1. **Capa de aplicación** — `PatientService` verifica `ExistsAsync` antes de crear/actualizar y lanza `DuplicatePatientException`, que el middleware mapea a **409 Conflict** con un `message`.
2. **Base de datos** — el índice único `UX_Patients_Document` es la autoridad final. `PatientRepository.SaveChangesAsync` detecta los errores 2601/2627 de SQL Server (violación de restricción única) y los convierte en la misma `DuplicatePatientException`, cubriendo peticiones concurrentes (la carrera verificar-luego-insertar).

### Validación

FluentValidation (`CreatePatientValidator`, `UpdatePatientValidator`) valida campos obligatorios, longitudes máximas, una `BirthDate` no futura y el formato de `Email`. Una validación fallida produce **400** con `{ message: "Validation failed.", details: [ ... ] }`.

### Manejo consistente de errores

`GlobalExceptionMiddleware` es el único lugar que convierte excepciones en respuestas:

| Excepción | Estado HTTP | Cuerpo |
|---|---|---|
| `PatientNotFoundException` | 404 | `{ message }` |
| `DuplicatePatientException` | 409 | `{ message }` |
| `ValidationException` de FluentValidation | 400 | `{ message, details[] }` |
| Cualquier otra | 500 | `{ message: "An unexpected error occurred." }` (registrada) |

### CreatedAt

La API establece `CreatedAt = DateTime.UtcNow` en el servicio para que las pruebas y el runtime se comporten de forma idéntica; la columna conserva un valor por defecto `SYSUTCDATETIME()` para filas insertadas fuera de EF (por ejemplo, `seed.sql`).

### Paginación y filtros

`GET /api/patients` admite paginación en servidor: `page` (≥ 1), `pageSize` (1–100, por defecto 10), `name` (contiene, sobre `FirstName`/`LastName` — sin distinción de mayúsculas en SQL Server) y `documentNumber` (exacto). La respuesta incluye `totalCount`, `page`, `pageSize` y `totalPages`, que el frontend Angular usa para su tabla perezosa.

## Endpoints

| Método | Ruta | Descripción | Éxito | Errores |
|---|---|---|---|---|
| POST | `/api/patients` | Crear un paciente | 201 + paciente | 400 validación, 409 documento duplicado |
| GET | `/api/patients` | Listado paginado con filtros `page`, `pageSize`, `name`, `documentNumber` | 200 resultado paginado | 400 paginación inválida |
| GET | `/api/patients/{id}` | Obtener un paciente | 200 + paciente | 404 |
| PUT | `/api/patients/{id}` | Actualización total | 200 + paciente | 400, 404, 409 |
| DELETE | `/api/patients/{id}` | Eliminar un paciente | 204 | 404 |
| GET | `/api/patients/created-after?from=2024-01-01` | Pacientes creados después de una fecha (procedimiento almacenado) | 200 lista | 400 falta `from` |
| GET | `/api/patients/stats` | Totales + conteos mensuales (ventana de 12 meses) | 200 estadísticas | — |

Ejemplo de cuerpo de petición (crear/actualizar):

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

## Cobertura de pruebas

- `PatientServiceTests` — creación exitosa, rechazo de duplicados, paginación + filtros (contiene/exacto), actualización (conservar el propio documento, no encontrado, duplicado por otro paciente), eliminación (éxito/no encontrado), estadísticas (totales, ventana de 12 meses, exclusión de pacientes antiguos).
- `PatientsControllerTests` — códigos de estado y formas de respuesta de todos los endpoints (Moq).
- `GlobalExceptionMiddlewareTests` — mapeo excepción-a-HTTP (404/409/400/500).

La ruta del procedimiento almacenado con `FromSqlRaw` se cubre de extremo a extremo solo contra un SQL Server real (EF InMemory no admite SQL sin procesar).
