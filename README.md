# Patients Management — Prueba Técnica Full-Stack

Aplicación full-stack de gestión de pacientes: una **API REST en .NET 8** respaldada por **SQL Server** con un SPA en **Angular 16** construido sobre **PrimeNG** y **Tailwind CSS**.

La aplicación cubre el ciclo de vida completo del paciente (crear, leer, actualizar, eliminar), búsqueda y paginación en servidor, protección contra documentos duplicados, exportación CSV/Excel, dashboard de estadísticas, modo oscuro y una barra de progreso global de peticiones.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Angular 16, TypeScript, PrimeNG 16, Tailwind CSS 3, Karma/Jasmine |
| Backend | .NET 8 (LTS), ASP.NET Core Web API, EF Core 8, FluentValidation, xUnit |
| Base de datos | SQL Server (2019+), procedimientos almacenados, migraciones EF Core |
| SPA | xlsx (exportación Excel en cliente), sin librería de gráficos (gráfico solo con CSS) |

## Arquitectura

```
+------------------+     HTTP/JSON      +----------------------+     EF Core     +----------------+
|  SPA Angular 16  | -----------------> |  Web API .NET 8      | --------------> |  SQL Server    |
|  PrimeNG + TW    | <----------------- |  Patients.Api        | <-------------- |  PatientsDB    |
+------------------+      ApiError      +----------------------+     SQL         +----------------+
                                          |         |
                              Aplicación   v         v  Infraestructura
                              PatientService          PatientRepository
                              (casos de uso)          (EF Core + proc. almac.)
                                          |         |
                                          v         v
                              FluentValidation    dbo.sp_GetPatientsCreatedAfter
                              (validadores)
```

La API sigue una arquitectura por capas con dirección de dependencias estricta:

```
Patients.Api -> Patients.Application -> Patients.Domain
Patients.Api -> Patients.Infrastructure -> Patients.Application -> Patients.Domain
```

## Estructura del repositorio

```
backend/
  Patients.sln
  src/
    Patients.Domain/          Entidades (independientes de persistencia)
    Patients.Application/     DTOs, validadores, capa de servicios, interfaz de repositorio
    Patients.Infrastructure/  DbContext de EF Core, repositorio, migraciones
    Patients.Api/             Controladores, middleware, Swagger, composición raíz de DI
  tests/
    Patients.Tests/           xUnit + Moq + EF Core InMemory (30 pruebas)
frontend/
  src/app/
    core/                     Servicio HTTP, interceptores, servicios de loading/tema, modelos
    features/patients/        listado, formulario, detalle, diálogo de reportes (carga diferida)
    features/dashboard/       tarjetas KPI + gráfico de barras mensual (carga diferida)
database/
  schema.sql                  Tabla + restricción única
  sp_GetPatientsCreatedAfter.sql
  seed.sql                    Datos de ejemplo
```

## Requisitos previos

- .NET SDK 8.0 (`global.json` fija `8.0.423`)
- SQL Server 2019+ (instancia local o remota)
- Node.js 18+ y Angular CLI 16 (`npm install -g @angular/cli@16`)

## Configuración de la base de datos

```powershell
sqlcmd -S localhost -i database/schema.sql
sqlcmd -S localhost -i database/sp_GetPatientsCreatedAfter.sql
sqlcmd -S localhost -i database/seed.sql
```

Alternativa: las migraciones de EF Core crean el esquema idéntico:

```powershell
dotnet ef database update --project backend/src/Patients.Infrastructure --startup-project backend/src/Patients.Api
```

## Backend

```powershell
dotnet run --project backend/src/Patients.Api
```

- HTTP: http://localhost:5000 — Swagger UI en `/swagger`
- HTTPS: https://localhost:5001

Pruebas (se ejecutan sin SQL Server — EF Core InMemory + Moq):

```powershell
dotnet test backend/Patients.sln
```

## Frontend

```powershell
cd frontend
npm install
npm start
```

- Servidor de desarrollo: http://localhost:4200
- El SPA consume `http://localhost:5000/api` (`frontend/src/environments/environment.ts`)

Pruebas:

```powershell
npx ng test --watch=false
```

Build:

```powershell
npm run build
```

## Endpoints de la API

| Método | Ruta | Descripción | Éxito | Errores |
|---|---|---|---|---|
| POST | `/api/patients` | Crear un paciente | 201 + paciente | 400 validación, 409 duplicado |
| GET | `/api/patients?page=&pageSize=&name=&documentNumber=` | Listado paginado con filtros | 200 resultado paginado | 400 paginación inválida |
| GET | `/api/patients/{id}` | Obtener un paciente | 200 + paciente | 404 |
| PUT | `/api/patients/{id}` | Actualización total | 200 + paciente | 400, 404, 409 |
| DELETE | `/api/patients/{id}` | Eliminar un paciente | 204 | 404 |
| GET | `/api/patients/created-after?from=2024-01-01` | Pacientes creados después de una fecha (procedimiento almacenado) | 200 lista | 400 falta `from` |
| GET | `/api/patients/stats` | Totales + conteos mensuales (ventana de 12 meses) | 200 estadísticas | — |

Las respuestas de error usan una forma consistente: `{ "message": "...", "details": ["..."] }` (`details` solo en validaciones).

## Decisiones clave

- **Documentos duplicados**: la regla de negocio se aplica en `PatientService` (409) *y* la restricción `UNIQUE` de la base de datos sobre `(DocumentType, DocumentNumber)` actúa como respaldo ante condiciones de carrera (el error SQL 2601/2627 se convierte en el mismo 409).
- **Semántica de PUT**: `PUT` realiza un reemplazo total de los campos editables, siguiendo la semántica HTTP (no se expone un endpoint de actualización parcial).
- **Validación**: los validadores FluentValidation se ejecutan en la capa de servicios (crear/actualizar) y se mapean a `400` con `details[]`.
- **Endpoint de estadísticas**: el `GroupBy` de EF Core se traduce a `GROUP BY` nativo de SQL; el servicio completa la ventana de 12 meses con ceros para que el eje del gráfico sea estable.
- **Frontend**: paginación diferida en servidor con búsqueda con debounce; `ConfirmationService` de PrimeNG para acciones destructivas; exportación CSV y Excel basada en el procedimiento almacenado `created-after`; gráfico de barras solo con CSS (sin librería de gráficos); modo oscuro mediante el tema `lara-dark-blue` de PrimeNG activado con un `<link>` en tiempo de ejecución y variantes `dark:` de Tailwind; barra de progreso indeterminada global impulsada por el interceptor HTTP.


