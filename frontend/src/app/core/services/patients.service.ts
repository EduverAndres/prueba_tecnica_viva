import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PagedPatients, Patient, PatientPayload, PatientQuery, PatientsStats } from '../models/patient.model';

@Injectable({ providedIn: 'root' })
export class PatientsService {
  private readonly apiUrl = `${environment.apiUrl}/patients`;

  constructor(private http: HttpClient) {}

  getPatients(query: PatientQuery): Observable<PagedPatients> {
    let params = new HttpParams()
      .set('page', String(query.page))
      .set('pageSize', String(query.pageSize));

    if (query.name) {
      params = params.set('name', query.name);
    }
    if (query.documentNumber) {
      params = params.set('documentNumber', query.documentNumber);
    }

    return this.http.get<PagedPatients>(this.apiUrl, { params });
  }

  getPatient(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/${id}`);
  }

  createPatient(payload: PatientPayload): Observable<Patient> {
    return this.http.post<Patient>(this.apiUrl, payload);
  }

  updatePatient(id: number, payload: PatientPayload): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/${id}`, payload);
  }

  deletePatient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getPatientsCreatedAfter(from: string): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.apiUrl}/created-after`, {
      params: new HttpParams().set('from', from)
    });
  }

  getStats(): Observable<PatientsStats> {
    return this.http.get<PatientsStats>(`${this.apiUrl}/stats`);
  }
}
