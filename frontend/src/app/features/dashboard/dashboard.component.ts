import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { PatientsStats } from '../../core/models/patient.model';
import { PatientsService } from '../../core/services/patients.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: PatientsStats | null = null;
  loading = true;
  maxMonthlyCount = 0;
  avgPerMonth = 0;

  private readonly monthShortNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  private readonly destroy$ = new Subject<void>();

  constructor(private patientsService: PatientsService) {}

  ngOnInit(): void {
    this.patientsService.getStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.stats = stats;
          this.maxMonthlyCount = Math.max(1, ...stats.byMonth.map((m) => m.count));
          this.avgPerMonth = Math.round(
            stats.byMonth.reduce((sum, m) => sum + m.count, 0) / Math.max(1, stats.byMonth.length)
          );
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  monthLabel(month: string): string {
    const monthNumber = Number(month.slice(5, 7));
    return this.monthShortNames[monthNumber - 1] ?? month;
  }

  barHeight(count: number): number {
    return Math.round((count / this.maxMonthlyCount) * 100);
  }
}
