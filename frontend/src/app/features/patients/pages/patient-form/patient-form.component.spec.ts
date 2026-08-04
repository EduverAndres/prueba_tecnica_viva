import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { of, throwError } from 'rxjs';

import { Patient } from '../../../../core/models/patient.model';
import { PatientsService } from '../../../../core/services/patients.service';
import { PatientFormComponent } from './patient-form.component';

describe('PatientFormComponent', () => {
  let component: PatientFormComponent;
  let fixture: ComponentFixture<PatientFormComponent>;
  let service: jasmine.SpyObj<PatientsService>;

  const activatedRouteStub = {
    snapshot: {
      paramMap: { get: () => null },
      url: [{ path: 'new' }]
    }
  };

  const createdPatient: Patient = {
    patientId: 1,
    documentType: 'DNI',
    documentNumber: '30123456',
    firstName: 'María',
    lastName: 'González',
    birthDate: '1988-03-14',
    phoneNumber: null,
    email: null,
    createdAt: '2026-08-01T12:00:00Z'
  };

  beforeEach(async () => {
    service = jasmine.createSpyObj('PatientsService', [
      'getPatients',
      'getPatient',
      'createPatient',
      'updatePatient',
      'deletePatient',
      'getPatientsCreatedAfter'
    ]);
    service.createPatient.and.returnValue(of(createdPatient));

    await TestBed.configureTestingModule({
      declarations: [PatientFormComponent],
      imports: [
        NoopAnimationsModule,
        ReactiveFormsModule,
        FormsModule,
        InputTextModule,
        DropdownModule,
        CalendarModule,
        ButtonModule,
        ToastModule
      ],
      providers: [
        { provide: PatientsService, useValue: service },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be invalid when required fields are empty', () => {
    expect(component.form.valid).toBeFalse();
    expect(component.form.controls['documentType'].hasError('required')).toBeTrue();
    expect(component.form.controls['documentNumber'].hasError('required')).toBeTrue();
    expect(component.form.controls['firstName'].hasError('required')).toBeTrue();
    expect(component.form.controls['lastName'].hasError('required')).toBeTrue();
    expect(component.form.controls['birthDate'].hasError('required')).toBeTrue();
  });

  it('should validate an invalid email format', () => {
    component.form.patchValue({
      documentType: 'DNI',
      documentNumber: '30123456',
      firstName: 'María',
      lastName: 'González',
      birthDate: new Date(1988, 2, 14),
      email: 'not-an-email'
    });

    expect(component.form.controls['email'].hasError('email')).toBeTrue();
    expect(component.form.valid).toBeFalse();
  });

  it('should call createPatient with the formatted payload on submit', () => {
    component.form.patchValue({
      documentType: 'DNI',
      documentNumber: '30123456',
      firstName: 'María',
      lastName: 'González',
      birthDate: new Date(1988, 2, 14),
      phoneNumber: '',
      email: ''
    });

    component.onSubmit();

    expect(service.createPatient).toHaveBeenCalledWith(
      jasmine.objectContaining({
        documentType: 'DNI',
        documentNumber: '30123456',
        birthDate: '1988-03-14',
        phoneNumber: null,
        email: null
      })
    );
  });

  it('should mark the document as duplicate when the API returns 409', () => {
    service.createPatient.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 409, error: { message: 'A patient with the same document already exists.' } }))
    );

    component.form.patchValue({
      documentType: 'DNI',
      documentNumber: '30123456',
      firstName: 'María',
      lastName: 'González',
      birthDate: new Date(1988, 2, 14),
      phoneNumber: '',
      email: ''
    });

    component.onSubmit();

    expect(component.form.controls['documentNumber'].hasError('duplicate')).toBeTrue();
    expect(component.submitting).toBeFalse();
  });
});