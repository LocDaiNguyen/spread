import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { PersonalSettingsRoutingModule } from './personal-settings-routing.module';

import { PersonalSettingsComponent } from './personal-settings.component';
import { AccountFormComponent } from './account-form/account-form.component';
import { PasswordFormComponent } from './password-form/password-form.component';
import { AvatarFormComponent } from './avatar-form/avatar-form.component';

import { PersonalSettingsResolver } from './personal-settings-resolver.service';

@NgModule({
  imports: [
    SharedModule,
    PersonalSettingsRoutingModule
  ],
  declarations: [
    PersonalSettingsComponent,
    PasswordFormComponent,
    AvatarFormComponent,
    AccountFormComponent
  ],
  providers: [
    PersonalSettingsResolver
  ]
})
export class PersonalSettingsModule { }
