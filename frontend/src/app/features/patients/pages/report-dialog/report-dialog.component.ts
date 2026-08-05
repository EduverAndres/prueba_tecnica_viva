import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import * as XLSX from 'xlsx';

import { Patient } from '../../../../core/models/patient.model';
import { I18nService } from '../../../../core/services/i18n.service';
import { PatientsService } from '../../../../core/services/patients.service';

@Component({
  selector: 'app-report-dialog',
  templateUrl: './report-dialog.component.html',
  styleUrls: ['./report-dialog.component.css']
})
export class ReportDialogComponent {
  visible = false;
  fromDate?: Date;
  exporting = false;
  today = new Date();

  constructor(
    private patientsService: PatientsService,
    private messageService: MessageService,
    private i18nService: I18nService
  ) {}

  open(): void {
    this.visible = true;
  }

  close(): void {
    this.visible = false;
    this.exporting = false;
  }

  exportExcel(): void {
    this.fetchAndExport((patients) => this.downloadExcel(patients));
  }

  exportCsv(): void {
    this.fetchAndExport((patients) => this.downloadCsv(patients));
  }

  private fetchAndExport(action: (patients: Patient[]) => void): void {
    if (!this.fromDate) {
      return;
    }

    this.exporting = true;
    this.patientsService.getPatientsCreatedAfter(toApiDate(this.fromDate)).subscribe({
      next: (patients) => {
        this.exporting = false;
        if (patients.length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: this.i18nService.translate('report.noResults.summary'),
            detail: this.i18nService.translate('report.noResults.detail')
          });
          return;
        }
        action(patients);
        this.messageService.add({
          severity: 'success',
          summary: this.i18nService.translate('report.exported.summary'),
          detail: this.i18nService.translate('report.exported.detail', { count: patients.length })
        });
      },
      error: () => {
        this.exporting = false;
      }
    });
  }

  private toRowArray(patient: Patient): (string | number | null)[] {
    return [
      patient.patientId,
      patient.documentType,
      patient.documentNumber,
      patient.firstName,
      patient.lastName,
      patient.birthDate,
      patient.phoneNumber,
      patient.email,
      patient.createdAt
    ];
  }

  private downloadExcel(patients: Patient[]): void {
    const header = ['PatientId', 'DocumentType', 'DocumentNumber', 'FirstName', 'LastName', 'BirthDate', 'PhoneNumber', 'Email', 'CreatedAt'];
    const rows = patients.map((p) => this.toRowArray(p));
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Patients');
    XLSX.writeFile(workbook, `patients-created-after-${toApiDate(this.fromDate!)}.xlsx`);
  }

  private downloadCsv(patients: Patient[]): void {
    const header = ['PatientId', 'DocumentType', 'DocumentNumber', 'FirstName', 'LastName', 'BirthDate', 'PhoneNumber', 'Email', 'CreatedAt'];
    const escape = (value: string | number | null): string => {
      const text = value === null || value === undefined ? '' : String(value);
      return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };

    const rows = patients.map((patient) =>
      this.toRowArray(patient).map(escape).join(',')
    );

    const csv = [header.join(','), ...rows].join('\r\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `patients-created-after-${toApiDate(this.fromDate!)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

function toApiDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
