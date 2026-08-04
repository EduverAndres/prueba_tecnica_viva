import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { Patient } from '../../../../core/models/patient.model';
import { PatientsService } from '../../../../core/services/patients.service';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.css']
})
export class PatientListComponent implements OnInit, OnDestroy {
  patients: Patient[] = [];
  totalRecords = 0;
  pageSize = 10;
  first = 0;
  loading = false;
  nameFilter = '';
  documentNumberFilter = '';

  private searchInput$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(
    private patientsService: PatientsService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.searchInput$
      .pipe(debounceTime(400), takeUntil(this.destroy$))
      .subscribe(() => this.resetAndLoad());
    this.resetAndLoad();
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    this.first = event.first ?? 0;
    this.loadPage(this.first / this.pageSize + 1);
  }

  onSearchInput(): void {
    this.searchInput$.next();
  }

  searchNow(): void {
    this.resetAndLoad();
  }

  clearFilters(): void {
    this.nameFilter = '';
    this.documentNumberFilter = '';
    this.resetAndLoad();
  }

  createPatient(): void {
    this.router.navigate(['/patients', 'new']);
  }

  viewPatient(patient: Patient): void {
    this.router.navigate(['/patients', patient.patientId]);
  }

  editPatient(patient: Patient): void {
    this.router.navigate(['/patients', patient.patientId, 'edit']);
  }

  confirmDelete(patient: Patient): void {
    this.confirmationService.confirm({
      message: `Delete patient ${patient.firstName} ${patient.lastName}?`,
      header: 'Confirm deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deletePatient(patient)
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resetAndLoad(): void {
    this.first = 0;
    this.loadPage(1);
  }

  private loadPage(page: number): void {
    this.loading = true;
    this.patientsService
      .getPatients({
        page,
        pageSize: this.pageSize,
        name: this.nameFilter.trim() || undefined,
        documentNumber: this.documentNumberFilter.trim() || undefined
      })
      .subscribe({
        next: (result) => {
          this.patients = result.data;
          this.totalRecords = result.totalCount;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  private deletePatient(patient: Patient): void {
    this.patientsService.deletePatient(patient.patientId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Patient deleted successfully.'
        });
        this.resetAndLoad();
      }
    });
  }
}
