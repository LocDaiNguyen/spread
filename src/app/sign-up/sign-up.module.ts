import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { SignUpRoutingModule } from './sign-up-routing.module';

import { SignUpComponent } from './sign-up.component';
import { SignUpFormComponent } from './sign-up-form/sign-up-form.component';
import { SuccessComponent } from './success/success.component';

@NgModule({
  imports: [
    SharedModule,
    SignUpRoutingModule
  ],
  declarations: [
    SignUpComponent,
    SignUpFormComponent,
    SuccessComponent,
  ]
})
export class SignUpModule { }
