import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { of } from 'rxjs';

import { PagedPatients, Patient } from '../../../../core/models/patient.model';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { PatientsService } from '../../../../core/services/patients.service';
import { ReportDialogComponent } from '../report-dialog/report-dialog.component';
import { PatientListComponent } from './patient-list.component';

describe('PatientListComponent', () => {
  let component: PatientListComponent;
  let fixture: ComponentFixture<PatientListComponent>;
  let service: jasmine.SpyObj<PatientsService>;

  const patients: Patient[] = [
    {
      patientId: 1,
      documentType: 'DNI',
      documentNumber: '30123456',
      firstName: 'María',
      lastName: 'González',
      birthDate: '1988-03-14',
      phoneNumber: '+54 11 5555-0101',
      email: 'maria@example.com',
      createdAt: '2026-08-01T12:00:00Z'
    },
    {
      patientId: 2,
      documentType: 'PAS',
      documentNumber: 'AA1234567',
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      birthDate: '1990-07-21',
      phoneNumber: null,
      email: null,
      createdAt: '2026-08-02T12:00:00Z'
    }
  ];

  const paged: PagedPatients = { data: patients, totalCount: 2, page: 1, pageSize: 10, totalPages: 1 };

  beforeEach(async () => {
    service = jasmine.createSpyObj('PatientsService', [
      'getPatients',
      'getPatient',
      'createPatient',
      'updatePatient',
      'deletePatient',
      'getPatientsCreatedAfter'
    ]);
    service.getPatients.and.returnValue(of(paged));

    await TestBed.configureTestingModule({
      declarations: [PatientListComponent, ReportDialogComponent, TranslatePipe],
      imports: [
        NoopAnimationsModule,
        FormsModule,
        TableModule,
        InputTextModule,
        ButtonModule,
        CalendarModule,
        ConfirmDialogModule,
        DialogModule,
        ToastModule,
        TooltipModule
      ],
      providers: [
        { provide: PatientsService, useValue: service },
        ConfirmationService,
        MessageService,
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load the first page on init and render one row per patient', () => {
    expect(service.getPatients).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      name: undefined,
      documentNumber: undefined
    });
    expect(component.patients.length).toBe(2);
    expect(component.totalRecords).toBe(2);
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('María');
  });

  it('should reload page 1 when a filter search is triggered', () => {
    component.nameFilter = 'Juan';
    component.searchNow();

    expect(service.getPatients).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      name: 'Juan',
      documentNumber: undefined
    });
    expect(component.first).toBe(0);
  });

  it('should load the requested page on lazy pagination', () => {
    component.onLazyLoad({ first: 10 } as TableLazyLoadEvent);

    expect(service.getPatients).toHaveBeenCalledWith({
      page: 2,
      pageSize: 10,
      name: undefined,
      documentNumber: undefined
    });
  });

  it('should delete a patient after confirmation', () => {
    service.deletePatient.and.returnValue(of(undefined));

    component.confirmDelete(patients[0]);
    fixture.detectChanges();

    const acceptButton = fixture.nativeElement.querySelector('.p-confirm-dialog-accept');
    expect(acceptButton).toBeTruthy();
    acceptButton.click();

    expect(service.deletePatient).toHaveBeenCalledWith(1);
  });
});