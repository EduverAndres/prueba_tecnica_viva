import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Patient } from '../../../../core/models/patient.model';
import { PatientsService } from '../../../../core/services/patients.service';

export interface Appointment {
  id: number;
  date: Date;
  doctor: string;
  specialty: string;
  status: string;
}

@Component({
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.css']
})
export class PatientDetailComponent implements OnInit {
  patient?: Patient;
  loading = true;

  // Placeholder until an appointments endpoint exists (see frontend README).
  readonly appointments: Appointment[] = [
    { id: 1, date: new Date(2026, 6, 15, 9, 30), doctor: 'Dr. Laura Méndez', specialty: 'General Medicine', status: 'Completed' },
    { id: 2, date: new Date(2026, 7, 2, 11, 0), doctor: 'Dr. Pablo Ríos', specialty: 'Cardiology', status: 'Scheduled' }
  ];

  constructor(
    private route: ActivatedRoute,
    private patientsService: PatientsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.patientsService.getPatient(id).subscribe({
      next: (patient) => {
        this.patient = patient;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/patients']);
  }
}