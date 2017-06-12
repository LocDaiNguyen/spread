import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PasswordsComponent } from './passwords.component';
import { RequestFormComponent } from './request-form/request-form.component';
import { ResetFormComponent } from './reset-form/reset-form.component';
import { SuccessComponent } from './success/success.component';

const routes: Routes = [
  {
    path: '',
    component: PasswordsComponent,
    children: [
      {
        path: 'request',
        component: RequestFormComponent
      },
      {
        path: 'success',
        component: SuccessComponent
      },
      {
        path: ':id',
        component: ResetFormComponent
      },
      {
        path: '',
        component: RequestFormComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PasswordsRoutingModule { }
