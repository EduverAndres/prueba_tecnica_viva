import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { PagedPatients, Patient, PatientPayload } from '../models/patient.model';
import { PatientsService } from './patients.service';

describe('PatientsService', () => {
  let service: PatientsService;
  let httpMock: HttpTestingController;

  const patient: Patient = {
    patientId: 1,
    documentType: 'DNI',
    documentNumber: '30123456',
    firstName: 'María',
    lastName: 'González',
    birthDate: '1988-03-14',
    phoneNumber: '+54 11 5555-0101',
    email: 'maria@example.com',
    createdAt: '2026-08-01T12:00:00Z'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PatientsService]
    });
    service = TestBed.inject(PatientsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should GET the paginated list and forward filters as query params', () => {
    const paged: PagedPatients = { data: [patient], totalCount: 1, page: 1, pageSize: 10, totalPages: 1 };

    service.getPatients({ page: 2, pageSize: 25, name: 'Juan', documentNumber: '32109876' }).subscribe((result) => {
      expect(result).toEqual(paged);
    });

    const request = httpMock.expectOne((req) => req.method === 'GET' && req.url.endsWith('/api/patients'));
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('pageSize')).toBe('25');
    expect(request.request.params.get('name')).toBe('Juan');
    expect(request.request.params.get('documentNumber')).toBe('32109876');
    request.flush(paged);
  });

  it('should GET a patient by id', () => {
    service.getPatient(7).subscribe((result) => {
      expect(result).toEqual(patient);
    });

    const request = httpMock.expectOne((req) => req.method === 'GET' && req.url.endsWith('/api/patients/7'));
    request.flush(patient);
  });

  it('should POST a patient on create', () => {
    const payload: PatientPayload = {
      documentType: 'DNI',
      documentNumber: '30123456',
      firstName: 'María',
      lastName: 'González',
      birthDate: '1988-03-14',
      phoneNumber: null,
      email: null
    };

    service.createPatient(payload).subscribe((result) => {
      expect(result).toEqual(patient);
    });

    const request = httpMock.expectOne((req) => req.method === 'POST' && req.url.endsWith('/api/patients'));
    expect(request.request.body).toEqual(payload);
    request.flush(patient);
  });

  it('should PUT a patient on update', () => {
    const payload: PatientPayload = {
      documentType: 'DNI',
      documentNumber: '30123456',
      firstName: 'María',
      lastName: 'Gómez',
      birthDate: '1988-03-14',
      phoneNumber: null,
      email: null
    };

    service.updatePatient(1, payload).subscribe((result) => {
      expect(result.lastName).toBe('Gómez');
    });

    const request = httpMock.expectOne((req) => req.method === 'PUT' && req.url.endsWith('/api/patients/1'));
    request.flush({ ...patient, lastName: 'Gómez' });
  });

  it('should DELETE a patient', () => {
    service.deletePatient(1).subscribe(() => {
      // completion only
    });

    const request = httpMock.expectOne((req) => req.method === 'DELETE' && req.url.endsWith('/api/patients/1'));
    request.flush(null);
  });

  it('should rethrow an HttpErrorResponse when the API fails', () => {
    let capturedError: HttpErrorResponse | undefined;

    service.deletePatient(999).subscribe({
      error: (error: HttpErrorResponse) => {
        capturedError = error;
      }
    });

    const request = httpMock.expectOne((req) => req.method === 'DELETE');
    request.flush({ message: 'Patient with id 999 was not found.' }, { status: 404, statusText: 'Not Found' });

    expect(capturedError?.status).toBe(404);
    expect(capturedError?.error.message).toBe('Patient with id 999 was not found.');
  });

  it('should GET patients created after a date (stored procedure endpoint)', () => {
    service.getPatientsCreatedAfter('2026-08-01').subscribe((result) => {
      expect(result).toEqual([patient]);
    });

    const request = httpMock.expectOne((req) => req.method === 'GET' && req.url.endsWith('/api/patients/created-after'));
    expect(request.request.params.get('from')).toBe('2026-08-01');
    request.flush([patient]);
  });
});