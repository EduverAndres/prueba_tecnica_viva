export interface Patient {
  patientId: number;
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  phoneNumber: string | null;
  email: string | null;
  createdAt: string;
}

export interface PagedPatients {
  data: Patient[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PatientPayload {
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  phoneNumber: string | null;
  email: string | null;
}

export interface PatientQuery {
  page: number;
  pageSize: number;
  name?: string;
  documentNumber?: string;
}
