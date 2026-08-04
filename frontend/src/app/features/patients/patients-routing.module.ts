import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PatientDetailComponent } from './pages/patient-detail/patient-detail.component';
import { PatientFormComponent } from './pages/patient-form/patient-form.component';
import { PatientListComponent } from './pages/patient-list/patient-list.component';

const routes: Routes = [
  { path: '', component: PatientListComponent },
  { path: 'new', component: PatientFormComponent },
  { path: ':id', component: PatientDetailComponent },
  { path: ':id/edit', component: PatientFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientsRoutingModule { }
