import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { PatientPayload } from '../../../../core/models/patient.model';
import { PatientsService } from '../../../../core/services/patients.service';

function birthDateNotInFuture(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  const value = control.value instanceof Date ? control.value : new Date(control.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return value > today ? { futureDate: true } : null;
}

@Component({
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.css']
})
export class PatientFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  patientId = 0;
  submitting = false;
  today = new Date();
  documentTypes = ['DNI', 'PAS', 'CE'];

  constructor(
    private fb: FormBuilder,
    private patientsService: PatientsService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      documentType: ['', Validators.required],
      documentNumber: ['', [Validators.required, Validators.maxLength(20)]],
      firstName: ['', [Validators.required, Validators.maxLength(80)]],
      lastName: ['', [Validators.required, Validators.maxLength(80)]],
      birthDate: [null, [Validators.required, birthDateNotInFuture]],
      phoneNumber: ['', Validators.maxLength(20)],
      email: ['', [Validators.email, Validators.maxLength(120)]]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    this.patientId = idParam ? Number(idParam) : 0;
    this.isEdit = this.route.snapshot.url.some((segment) => segment.path === 'edit');

    if (this.isEdit && this.patientId) {
      this.loadPatient(this.patientId);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload = this.buildPayload();
    const request$ = this.isEdit
      ? this.patientsService.updatePatient(this.patientId, payload)
      : this.patientsService.createPatient(payload);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: this.isEdit ? 'Updated' : 'Created',
          detail: 'Patient saved successfully.'
        });
        this.router.navigate(['/patients']);
      },
      error: (error: HttpErrorResponse) => {
        this.submitting = false;
        this.mapApiError(error);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/patients']);
  }

  private loadPatient(id: number): void {
    this.patientsService.getPatient(id).subscribe({
      next: (patient) => {
        this.form.patchValue({
          documentType: patient.documentType,
          documentNumber: patient.documentNumber,
          firstName: patient.firstName,
          lastName: patient.lastName,
          birthDate: parseApiDate(patient.birthDate),
          phoneNumber: patient.phoneNumber ?? '',
          email: patient.email ?? ''
        });
      }
    });
  }

  private buildPayload(): PatientPayload {
    const value = this.form.value;
    return {
      documentType: value.documentType,
      documentNumber: value.documentNumber.trim(),
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      birthDate: toApiDate(value.birthDate),
      phoneNumber: value.phoneNumber ? value.phoneNumber.trim() : null,
      email: value.email ? value.email.trim() : null
    };
  }

  private mapApiError(error: HttpErrorResponse): void {
    if (error.status === 409) {
      this.form.controls['documentNumber'].setErrors({ duplicate: true });
      this.form.controls['documentType'].setErrors({ duplicate: true });
    }
  }
}

function parseApiDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function toApiDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}