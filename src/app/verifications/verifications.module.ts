import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { VerificationsRoutingModule } from './verifications-routing.module';

import { VerificationsComponent } from './verifications.component';
import { ResendFormComponent } from './resend-form/resend-form.component';
import { VerifiedComponent } from './verified/verified.component';
import { SuccessComponent } from './success/success.component';
import { VerifyComponent } from './verify/verify.component';
import { DeactiveComponent } from './deactive/deactive.component';

@NgModule({
  imports: [
    SharedModule,
    VerificationsRoutingModule
  ],
  declarations: [
    VerificationsComponent,
    ResendFormComponent,
    VerifiedComponent,
    SuccessComponent,
    VerifyComponent,
    DeactiveComponent,
  ]
})
export class VerificationsModule { }
