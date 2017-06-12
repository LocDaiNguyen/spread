import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignUpComponent } from './sign-up.component';
import { SignUpFormComponent } from './sign-up-form/sign-up-form.component';
import { SuccessComponent } from './success/success.component';

const routes: Routes = [
  {
    path: '',
    component: SignUpComponent,
    children: [
      {
        path: 'success',
        component: SuccessComponent
      },
      {
        path: '',
        component: SignUpFormComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SignUpRoutingModule { }
