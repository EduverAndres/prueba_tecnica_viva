import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MessageService } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';

import { LoadingService } from './core/services/loading.service';
import { ThemeService } from './core/services/theme.service';
import { TranslatePipe } from './core/pipes/translate.pipe';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.getElementById('primeng-dark-theme')?.remove();

    await TestBed.configureTestingModule({
      declarations: [AppComponent, TranslatePipe],
      imports: [NoopAnimationsModule, ToastModule, ProgressBarModule, RouterTestingModule],
      providers: [MessageService, ThemeService, LoadingService]
    }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.getElementById('primeng-dark-theme')?.remove();
  });

  it('should render the app shell', () => {
    expect(fixture.nativeElement.querySelector('.app-title').textContent).toContain('Patients');
  });

  it('should toggle dark mode when the theme button is clicked', () => {
    const button = fixture.nativeElement.querySelector('button[aria-label="Switch to dark mode"]');
    expect(button).toBeTruthy();

    button.click();
    fixture.detectChanges();

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should render navigation links to dashboard and patients', () => {
    const links = fixture.nativeElement.querySelectorAll('nav a');
    const labels = Array.from(links).map((link) => (link as HTMLElement).textContent?.trim());

    expect(labels).toContain('Dashboard');
    expect(labels).toContain('Patients');
  });

  it('should toggle the language when the language button is clicked', () => {
    const button = fixture.nativeElement.querySelector('button[aria-label="Cambiar a español"]');
    expect(button).toBeTruthy();

    button.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.app-title').textContent).toContain('Pacientes');
    expect(localStorage.getItem('patients-language')).toBe('es');
  });
});
