import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  const currentValue = (s: ThemeService): boolean => {
    let value = false;
    s.isDark$.subscribe((v) => (value = v)).unsubscribe();
    return value;
  };

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.getElementById('primeng-dark-theme')?.remove();
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.getElementById('primeng-dark-theme')?.remove();
  });

  it('should default to light theme', () => {
    service = TestBed.inject(ThemeService);

    expect(currentValue(service)).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should apply dark class and load the dark theme link on toggle', () => {
    service = TestBed.inject(ThemeService);

    service.toggle();

    expect(currentValue(service)).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.getElementById('primeng-dark-theme')).toBeTruthy();
  });

  it('should remove the dark theme link when toggled back to light', () => {
    service = TestBed.inject(ThemeService);

    service.toggle();
    service.toggle();

    expect(currentValue(service)).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.getElementById('primeng-dark-theme')).toBeNull();
  });

  it('should persist the choice and restore it on a new instance', () => {
    service = TestBed.inject(ThemeService);
    service.toggle();

    const restored = TestBed.inject(ThemeService);

    expect(currentValue(restored)).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
