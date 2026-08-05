import { TestBed } from '@angular/core/testing';
import { PrimeNGConfig } from 'primeng/api';

import { I18nService } from './i18n.service';

describe('I18nService', () => {
  let service: I18nService;
  let primeNgConfig: PrimeNGConfig;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(I18nService);
    primeNgConfig = TestBed.inject(PrimeNGConfig);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should default to English', () => {
    expect(service.language).toBe('en');
    expect(service.translate('app.title')).toBe('Patients — Management');
  });

  it('should translate keys from the Spanish dictionary', () => {
    service.setLanguage('es');
    expect(service.translate('app.title')).toBe('Pacientes — Gestión');
    expect(service.translate('patients.list.title')).toBe('Pacientes');
  });

  it('should persist the selected language in localStorage', () => {
    service.setLanguage('es');
    expect(localStorage.getItem('patients-language')).toBe('es');
  });

  it('should restore the persisted language on construction', () => {
    localStorage.setItem('patients-language', 'es');
    service = new I18nService(TestBed.inject(PrimeNGConfig));
    expect(service.language).toBe('es');
  });

  it('should fall back to the English dictionary for missing keys', () => {
    service.setLanguage('es');
    expect(service.translate('report.exportCsv')).toBe('Exportar CSV');
  });

  it('should return the key itself when no translation exists', () => {
    expect(service.translate('missing.key')).toBe('missing.key');
  });

  it('should interpolate parameters into the translated text', () => {
    service.setLanguage('es');
    expect(service.translate('report.exported.detail', { count: 3 })).toBe('3 paciente(s) exportados.');
    expect(service.translate('patients.list.confirm.message', { name: 'María González' })).toBe('¿Eliminar al paciente María González?');
  });

  it('should emit the language through the observable and toggle it', () => {
    let current: string | undefined;
    service.language$.subscribe((lang) => (current = lang));
    expect(current).toBe('en');

    service.toggleLanguage();
    expect(service.language).toBe('es');
    expect(current).toBe('es');

    service.toggleLanguage();
    expect(service.language).toBe('en');
  });

  it('should push the PrimeNG translation when the language changes', () => {
    service.setLanguage('es');
    expect(primeNgConfig.translation.dayNamesMin).toEqual(['D', 'L', 'M', 'X', 'J', 'V', 'S']);
    expect(primeNgConfig.translation.firstDayOfWeek).toBe(1);

    service.setLanguage('en');
    expect(primeNgConfig.translation.dayNamesMin).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
    expect(primeNgConfig.translation.firstDayOfWeek).toBe(0);
  });
});
