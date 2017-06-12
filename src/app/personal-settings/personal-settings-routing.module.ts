import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PersonalSettingsComponent } from './personal-settings.component';
import { AccountFormComponent } from './account-form/account-form.component';
import { AvatarFormComponent } from './avatar-form/avatar-form.component';
import { PasswordFormComponent } from './password-form/password-form.component';

import { PersonalSettingsResolver } from './personal-settings-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: PersonalSettingsComponent,
    resolve: {
      user: PersonalSettingsResolver
    },
    children: [
      {
        path: 'account',
        component: AccountFormComponent
      },
      {
        path: 'avatar',
        component: AvatarFormComponent
      },
      {
        path: 'password',
        component: PasswordFormComponent
      },
      {
        path: '',
        component: AccountFormComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PersonalSettingsRoutingModule {}
