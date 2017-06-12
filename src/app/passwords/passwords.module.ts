import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { PasswordsRoutingModule } from './passwords-routing.module';

import { PasswordsComponent } from './passwords.component';
import { RequestFormComponent } from './request-form/request-form.component';
import { ResetFormComponent } from './reset-form/reset-form.component';
import { SuccessComponent } from './success/success.component';

@NgModule({
  imports: [
    SharedModule,
    PasswordsRoutingModule
  ],
  declarations: [
    PasswordsComponent,
    RequestFormComponent,
    ResetFormComponent,
    SuccessComponent,
  ]
})
export class PasswordsModule { }
