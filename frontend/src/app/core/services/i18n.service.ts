import { Injectable } from '@angular/core';
import { PrimeNGConfig, Translation } from 'primeng/api';
import { BehaviorSubject } from 'rxjs';

export type AppLanguage = 'en' | 'es';

type Dictionary = { [key: string]: string };

const en: Dictionary = {
  // App shell
  'app.title': 'Patients — Management',
  'app.subtitle': 'Patient records & appointments',
  'app.badge': 'Clinical data',
  'app.nav.dashboard': 'Dashboard',
  'app.nav.patients': 'Patients',
  'app.theme.dark': 'Switch to dark mode',
  'app.theme.light': 'Switch to light mode',
  'app.lang.es': 'Cambiar a español',
  'app.lang.en': 'Switch to English',

  // Patient list
  'patients.list.title': 'Patients',
  'patients.list.subtitle': 'Manage patient records and consult appointment history.',
  'patients.list.reports': 'Reports',
  'patients.list.newPatient': 'New patient',
  'patients.list.searchName': 'Search by name',
  'patients.list.searchDocument': 'Document number (exact)',
  'patients.list.search': 'Search',
  'patients.list.clear': 'Clear',
  'patients.list.th.document': 'Document',
  'patients.list.th.firstName': 'First name',
  'patients.list.th.lastName': 'Last name',
  'patients.list.th.email': 'Email',
  'patients.list.th.phone': 'Phone',
  'patients.list.th.createdAt': 'Created at',
  'patients.list.th.actions': 'Actions',
  'patients.list.view': 'View',
  'patients.list.edit': 'Edit',
  'patients.list.delete': 'Delete',
  'patients.list.empty.title': 'No patients found',
  'patients.list.empty.subtitle': 'Try adjusting your search or clear the filters.',
  'patients.list.confirm.header': 'Confirm deletion',
  'patients.list.confirm.message': 'Delete patient {name}?',
  'patients.list.deleted.summary': 'Deleted',
  'patients.list.deleted.detail': 'Patient deleted successfully.',

  // Patient form
  'patients.form.title.new': 'New patient',
  'patients.form.title.edit': 'Edit patient',
  'patients.form.subtitle.new': 'Fill in the details to register a new patient.',
  'patients.form.subtitle.edit': 'Update the patient record details.',
  'patients.form.documentType': 'Document type *',
  'patients.form.documentNumber': 'Document number *',
  'patients.form.firstName': 'First name *',
  'patients.form.lastName': 'Last name *',
  'patients.form.birthDate': 'Birth date *',
  'patients.form.phone': 'Phone',
  'patients.form.email': 'Email',
  'patients.form.placeholder.type': 'Select type',
  'patients.form.error.required': 'This field is required.',
  'patients.form.error.email': 'Enter a valid email address.',
  'patients.form.error.futureDate': 'Birth date cannot be in the future.',
  'patients.form.error.duplicate': 'A patient with this document already exists.',
  'patients.form.cancel': 'Cancel',
  'patients.form.create': 'Create patient',
  'patients.form.save': 'Save changes',
  'patients.form.saved.summary.created': 'Created',
  'patients.form.saved.summary.updated': 'Updated',
  'patients.form.saved.detail': 'Patient saved successfully.',

  // Patient detail
  'patients.detail.back': 'Back',
  'patients.detail.backToList': 'Back to patients',
  'patients.detail.subtitle': 'Patient record details and appointment history.',
  'patients.detail.document': 'Document',
  'patients.detail.birthDate': 'Birth date',
  'patients.detail.email': 'Email',
  'patients.detail.phone': 'Phone',
  'patients.detail.createdAt': 'Created at',
  'patients.detail.appointments.title': 'Appointments',
  'patients.detail.appointments.mock': 'Mock data — pending integration with an appointments API',
  'patients.detail.th.date': 'Date',
  'patients.detail.th.doctor': 'Doctor',
  'patients.detail.th.specialty': 'Specialty',
  'patients.detail.th.status': 'Status',
  'patients.detail.status.completed': 'Completed',
  'patients.detail.status.scheduled': 'Scheduled',
  'patients.detail.status.cancelled': 'Cancelled',
  'patients.detail.notFound.title': 'Patient not found',
  'patients.detail.notFound.subtitle': 'The patient record does not exist or was removed.',

  // Report dialog
  'report.header.title': 'Export patients report',
  'report.header.subtitle': 'Excel or CSV — patients created after a date',
  'report.info': 'Pick the cutoff date. Every patient created after that date will be included in the file.',
  'report.info.after': 'after',
  'report.fromDate': 'From date *',
  'report.selectDate': 'Select a date',
  'report.helper': 'The file includes document, names, birth date, contact details and creation date.',
  'report.cancel': 'Cancel',
  'report.exportCsv': 'Export CSV',
  'report.exportExcel': 'Export Excel',
  'report.noResults.summary': 'No results',
  'report.noResults.detail': 'No patients were created after the selected date.',
  'report.exported.summary': 'Exported',
  'report.exported.detail': '{count} patient(s) exported.',

  // Dashboard
  'dashboard.title': 'Dashboard',
  'dashboard.subtitle': 'Patient activity overview and monthly registration trends.',
  'dashboard.kpi.total': 'Total patients',
  'dashboard.kpi.last30': 'Created in last 30 days',
  'dashboard.kpi.avg': 'Average per month',
  'dashboard.chart.title': 'Patients created per month',
  'dashboard.chart.subtitle': 'Last 12 months',
  'dashboard.chart.months': '{count} months',
  'dashboard.chart.tooltip': '{count} patient(s) in {month}',
  'dashboard.empty.title': 'No data available',
  'dashboard.empty.subtitle': 'Patients will appear here once they are created.',

  // Errors
  'errors.connection.summary': 'Connection error',
  'errors.connection.detail': 'The API server is unreachable.',
  'errors.unexpected': 'An unexpected error occurred.',
  'errors.status': 'Error {status}'
};

const es: Dictionary = {
  'app.title': 'Pacientes — Gestión',
  'app.subtitle': 'Registros de pacientes y citas',
  'app.badge': 'Datos clínicos',
  'app.nav.dashboard': 'Dashboard',
  'app.nav.patients': 'Pacientes',
  'app.theme.dark': 'Cambiar a modo oscuro',
  'app.theme.light': 'Cambiar a modo claro',
  'app.lang.es': 'Cambiar a español',
  'app.lang.en': 'Switch to English',

  'patients.list.title': 'Pacientes',
  'patients.list.subtitle': 'Administre los registros de pacientes y consulte el historial de citas.',
  'patients.list.reports': 'Reportes',
  'patients.list.newPatient': 'Nuevo paciente',
  'patients.list.searchName': 'Buscar por nombre',
  'patients.list.searchDocument': 'Número de documento (exacto)',
  'patients.list.search': 'Buscar',
  'patients.list.clear': 'Limpiar',
  'patients.list.th.document': 'Documento',
  'patients.list.th.firstName': 'Nombre',
  'patients.list.th.lastName': 'Apellido',
  'patients.list.th.email': 'Correo',
  'patients.list.th.phone': 'Teléfono',
  'patients.list.th.createdAt': 'Creado el',
  'patients.list.th.actions': 'Acciones',
  'patients.list.view': 'Ver',
  'patients.list.edit': 'Editar',
  'patients.list.delete': 'Eliminar',
  'patients.list.empty.title': 'No se encontraron pacientes',
  'patients.list.empty.subtitle': 'Ajuste su búsqueda o limpie los filtros.',
  'patients.list.confirm.header': 'Confirmar eliminación',
  'patients.list.confirm.message': '¿Eliminar al paciente {name}?',
  'patients.list.deleted.summary': 'Eliminado',
  'patients.list.deleted.detail': 'Paciente eliminado correctamente.',

  'patients.form.title.new': 'Nuevo paciente',
  'patients.form.title.edit': 'Editar paciente',
  'patients.form.subtitle.new': 'Complete los datos para registrar un nuevo paciente.',
  'patients.form.subtitle.edit': 'Actualice los datos del registro del paciente.',
  'patients.form.documentType': 'Tipo de documento *',
  'patients.form.documentNumber': 'Número de documento *',
  'patients.form.firstName': 'Nombre *',
  'patients.form.lastName': 'Apellido *',
  'patients.form.birthDate': 'Fecha de nacimiento *',
  'patients.form.phone': 'Teléfono',
  'patients.form.email': 'Correo electrónico',
  'patients.form.placeholder.type': 'Seleccionar tipo',
  'patients.form.error.required': 'Este campo es obligatorio.',
  'patients.form.error.email': 'Ingrese un correo electrónico válido.',
  'patients.form.error.futureDate': 'La fecha de nacimiento no puede ser futura.',
  'patients.form.error.duplicate': 'Ya existe un paciente con este documento.',
  'patients.form.cancel': 'Cancelar',
  'patients.form.create': 'Crear paciente',
  'patients.form.save': 'Guardar cambios',
  'patients.form.saved.summary.created': 'Creado',
  'patients.form.saved.summary.updated': 'Actualizado',
  'patients.form.saved.detail': 'Paciente guardado correctamente.',

  'patients.detail.back': 'Volver',
  'patients.detail.backToList': 'Volver a pacientes',
  'patients.detail.subtitle': 'Detalles del registro del paciente e historial de citas.',
  'patients.detail.document': 'Documento',
  'patients.detail.birthDate': 'Fecha de nacimiento',
  'patients.detail.email': 'Correo electrónico',
  'patients.detail.phone': 'Teléfono',
  'patients.detail.createdAt': 'Creado el',
  'patients.detail.appointments.title': 'Citas',
  'patients.detail.appointments.mock': 'Datos de demostración — pendiente de integración con una API de citas',
  'patients.detail.th.date': 'Fecha',
  'patients.detail.th.doctor': 'Médico',
  'patients.detail.th.specialty': 'Especialidad',
  'patients.detail.th.status': 'Estado',
  'patients.detail.status.completed': 'Completada',
  'patients.detail.status.scheduled': 'Programada',
  'patients.detail.status.cancelled': 'Cancelada',
  'patients.detail.notFound.title': 'Paciente no encontrado',
  'patients.detail.notFound.subtitle': 'El registro del paciente no existe o fue eliminado.',

  'report.header.title': 'Exportar reporte de pacientes',
  'report.header.subtitle': 'Excel o CSV — pacientes creados después de una fecha',
  'report.info': 'Elija la fecha límite. Todos los pacientes creados después de esa fecha se incluirán en el archivo.',
  'report.info.after': 'después',
  'report.fromDate': 'Fecha desde *',
  'report.selectDate': 'Seleccionar una fecha',
  'report.helper': 'El archivo incluye documento, nombres, fecha de nacimiento, datos de contacto y fecha de creación.',
  'report.cancel': 'Cancelar',
  'report.exportCsv': 'Exportar CSV',
  'report.exportExcel': 'Exportar Excel',
  'report.noResults.summary': 'Sin resultados',
  'report.noResults.detail': 'No se crearon pacientes después de la fecha seleccionada.',
  'report.exported.summary': 'Exportado',
  'report.exported.detail': '{count} paciente(s) exportados.',

  'dashboard.title': 'Dashboard',
  'dashboard.subtitle': 'Resumen de actividad de pacientes y tendencias mensuales de registro.',
  'dashboard.kpi.total': 'Total de pacientes',
  'dashboard.kpi.last30': 'Creados en los últimos 30 días',
  'dashboard.kpi.avg': 'Promedio por mes',
  'dashboard.chart.title': 'Pacientes creados por mes',
  'dashboard.chart.subtitle': 'Últimos 12 meses',
  'dashboard.chart.months': '{count} meses',
  'dashboard.chart.tooltip': '{count} paciente(s) en {month}',
  'dashboard.empty.title': 'Sin datos disponibles',
  'dashboard.empty.subtitle': 'Los pacientes aparecerán aquí una vez que se creen.',

  'errors.connection.summary': 'Error de conexión',
  'errors.connection.detail': 'El servidor de la API no está disponible.',
  'errors.unexpected': 'Ocurrió un error inesperado.',
  'errors.status': 'Error {status}'
};

const primeNgTranslations: Record<AppLanguage, Translation> = {
  en: {
    accept: 'Yes',
    reject: 'No',
    choose: 'Choose',
    upload: 'Upload',
    cancel: 'Cancel',
    apply: 'Apply',
    clear: 'Clear',
    today: 'Today',
    weekHeader: 'Wk',
    firstDayOfWeek: 0,
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    dayNamesMin: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    dateFormat: 'mm/dd/yy',
    emptyMessage: 'No records found.',
    emptyFilterMessage: 'No records found.',
    aria: {
      pageLabel: 'Page',
      firstPageLabel: 'First page',
      lastPageLabel: 'Last page',
      nextPageLabel: 'Next page',
      prevPageLabel: 'Previous page',
      rowsPerPageLabel: 'Rows per page',
      jumpToPageDropdownLabel: 'Jump to page',
      jumpToPageInputLabel: 'Jump to page'
    }
  },
  es: {
    accept: 'Sí',
    reject: 'No',
    choose: 'Elegir',
    upload: 'Subir',
    cancel: 'Cancelar',
    apply: 'Aplicar',
    clear: 'Limpiar',
    today: 'Hoy',
    weekHeader: 'Sem',
    firstDayOfWeek: 1,
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
    monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    dateFormat: 'dd/mm/yy',
    emptyMessage: 'No se encontraron registros.',
    emptyFilterMessage: 'No se encontraron registros.',
    aria: {
      pageLabel: 'Página',
      firstPageLabel: 'Primera página',
      lastPageLabel: 'Última página',
      nextPageLabel: 'Página siguiente',
      prevPageLabel: 'Página anterior',
      rowsPerPageLabel: 'Filas por página',
      jumpToPageDropdownLabel: 'Ir a la página',
      jumpToPageInputLabel: 'Ir a la página'
    }
  }
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly storageKey = 'patients-language';
  private readonly dictionaries: Record<AppLanguage, Dictionary> = { en, es };
  private readonly languageSubject = new BehaviorSubject<AppLanguage>('en');

  language$ = this.languageSubject.asObservable();

  constructor(private primeNgConfig: PrimeNGConfig) {
    const stored = localStorage.getItem(this.storageKey);
    this.setLanguage(stored === 'es' ? 'es' : 'en');
  }

  get language(): AppLanguage {
    return this.languageSubject.value;
  }

  setLanguage(language: AppLanguage): void {
    this.languageSubject.next(language);
    localStorage.setItem(this.storageKey, language);
    this.primeNgConfig.setTranslation(primeNgTranslations[language]);
  }

  toggleLanguage(): void {
    this.setLanguage(this.language === 'en' ? 'es' : 'en');
  }

  translate(key: string, params?: Record<string, string | number>): string {
    const dictionary = this.dictionaries[this.language];
    let text = dictionary[key] ?? en[key] ?? key;
    if (params) {
      for (const [name, value] of Object.entries(params)) {
        text = text.replace(`{${name}}`, String(value));
      }
    }
    return text;
  }
}
