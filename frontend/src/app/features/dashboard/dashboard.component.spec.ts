import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { of } from 'rxjs';

import { PatientsStats } from '../../core/models/patient.model';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { PatientsService } from '../../core/services/patients.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let service: jasmine.SpyObj<PatientsService>;

  const stats: PatientsStats = {
    totalPatients: 5,
    createdLast30Days: 2,
    byMonth: [
      { month: '2026-08', count: 5 },
      { month: '2026-07', count: 3 },
      { month: '2026-06', count: 0 }
    ]
  };

  beforeEach(async () => {
    service = jasmine.createSpyObj('PatientsService', ['getStats']);
    service.getStats.and.returnValue(of(stats));

    await TestBed.configureTestingModule({
      declarations: [DashboardComponent, TranslatePipe],
      imports: [NoopAnimationsModule, SkeletonModule, TooltipModule],
      providers: [{ provide: PatientsService, useValue: service }]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load stats on init', () => {
    expect(service.getStats).toHaveBeenCalled();
    expect(component.stats).toEqual(stats);
    expect(component.loading).toBe(false);
  });

  it('should render KPI values', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Total patients');
    expect(text).toContain('5');
    expect(text).toContain('Created in last 30 days');
    expect(text).toContain('Average per month');
  });

  it('should render one bar per month with proportional height', () => {
    const bars = fixture.nativeElement.querySelectorAll('.chart-bar');
    expect(bars.length).toBe(3);
    expect(component.barHeight(5)).toBe(100);
    expect(component.barHeight(3)).toBe(60);
    expect(component.barHeight(0)).toBe(0);
  });

  it('should compute the average per month across the window', () => {
    expect(component.avgPerMonth).toBe(Math.round((5 + 3 + 0) / 3));
  });
});
