# Frontend — Angular 16

Aplicación SPA de gestión de pacientes construida con **Angular 16**, **PrimeNG 16** y **Tailwind CSS 3**.

## Estructura

```
src/app/
  core/
    models/                  Interfaces del dominio (Patient, PagedPatients, PatientsStats)
    services/                PatientsService (HTTP), LoadingService, ThemeService
    interceptors/            ErrorInterceptor (toasts de error + barra de progreso global)
    core.module.ts           Registro de interceptores HTTP
  features/
    patients/                Listado, formulario, detalle y diálogo de reportes (carga diferida)
    dashboard/               Dashboard con KPIs y gráfico mensual (carga diferida)
```

## Requisitos

- Node.js 18+
- Angular CLI 16 (`npm install -g @angular/cli@16`)

## Instalación y ejecución

```powershell
npm install
npm start
```

- Servidor de desarrollo: http://localhost:4200
- La aplicación consume la API en `http://localhost:5000/api` (configurable en `src/environments/environment.ts`)

## Pruebas

```powershell
npx ng test --watch=false
```

Pruebas unitarias con Karma + Jasmine (servicio HTTP, listado, formulario, dashboard, tema y loading).

## Build

```powershell
npm run build
```

Los artefactos se generan en `dist/`.

## Funcionalidades

- **Listado de pacientes**: tabla perezosa de PrimeNG con paginación en servidor, búsqueda con debounce por nombre y documento, badges por tipo de documento y confirmación para eliminar.
- **Formulario de paciente**: validación reactiva, validación duplicada en servidor (409) mostrada en línea, modo creación/edición.
- **Detalle de paciente**: datos del registro y citas (datos de demostración).
- **Reportes**: exportación CSV y Excel de pacientes creados después de una fecha, usando el procedimiento almacenado del backend.
- **Dashboard**: tarjetas KPI (total, creados en 30 días, promedio mensual) y gráfico de barras CSS puro de los últimos 12 meses, alimentado por `GET /api/patients/stats`.
- **Modo oscuro**: alternancia con el tema `lara-dark-blue` de PrimeNG y variantes `dark:` de Tailwind, persistido en `localStorage`.
- **Barra de progreso global**: indicador indeterminado activado por cualquier petición HTTP en curso.
