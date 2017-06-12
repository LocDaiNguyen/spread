import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VerificationsComponent } from './verifications.component';
import { ResendFormComponent } from './resend-form/resend-form.component';
import { VerifiedComponent } from './verified/verified.component';
import { SuccessComponent } from './success/success.component';
import { VerifyComponent } from './verify/verify.component';
import { DeactiveComponent } from './deactive/deactive.component';

const routes: Routes = [
  {
    path: '',
    component: VerificationsComponent,
    children: [
      {
        path: 'resend',
        component: ResendFormComponent
      },
      {
        path: 'success',
        component: SuccessComponent
      },
      {
        path: 'verify',
        component: VerifyComponent
      },
      {
        path: 'deactive',
        component: DeactiveComponent
      },
      {
        path: ':id',
        component: VerifiedComponent
      },
      {
        path: '',
        component: ResendFormComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VerificationsRoutingModule { }
