import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

import { SharedModule } from '../../shared/shared.module';

import { PatientsRoutingModule } from './patients-routing.module';
import { PatientDetailComponent } from './pages/patient-detail/patient-detail.component';
import { PatientFormComponent } from './pages/patient-form/patient-form.component';
import { PatientListComponent } from './pages/patient-list/patient-list.component';
import { ReportDialogComponent } from './pages/report-dialog/report-dialog.component';

@NgModule({
  declarations: [
    PatientListComponent,
    PatientFormComponent,
    PatientDetailComponent,
    ReportDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PatientsRoutingModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    CalendarModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    CardModule,
    TooltipModule,
    SharedModule
  ],
  providers: [ConfirmationService]
})
export class PatientsModule { }
