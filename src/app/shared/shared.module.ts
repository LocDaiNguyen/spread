import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterializeModule } from 'angular2-materialize';

import { TeamComponent } from './team/team.component';
import { RegisterFormComponent } from './register-form/register-form.component';
import { ErrorValidationComponent } from './error-validation/error-validation.component';
import { ErrorServerComponent } from './error-server/error-server.component';
import { SuccessValidationComponent } from './success-validation/success-validation.component';
import { NoDataComponent } from './no-data/no-data.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterializeModule
  ],
  exports: [
    CommonModule,
    HttpModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MaterializeModule,
    TeamComponent,
    RegisterFormComponent,
    ErrorValidationComponent,
    ErrorServerComponent,
    SuccessValidationComponent,
    NoDataComponent,
  ],
  declarations: [
    TeamComponent,
    RegisterFormComponent,
    ErrorValidationComponent,
    ErrorServerComponent,
    SuccessValidationComponent,
    NoDataComponent,
  ]
})
export class SharedModule { }
