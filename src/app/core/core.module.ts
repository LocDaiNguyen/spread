import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';

import { SettingService } from './services/setting.service';
import { TeamService } from './services/team.service';
import { GameService } from './services/game.service';
import { AuthService } from './services/auth.service';
import { PickService } from './services/pick.service';
import { AvatarService } from './services/avatar.service';
import { CurrentWeekService } from './services/current-week.service';
import { VerifyService } from './services/verify.service';
import { AuthGuard } from './services/auth.guard';
import { RoleGuard } from './services/role.guard';
import { ActiveGuard } from './services/active.guard';
import { VerifyGuard } from './services/verify.guard';
import { AlreadySigninGuard } from './services/already-signin.guard';

import { HeaderComponent } from './header/header.component';

@NgModule({
  imports: [
    SharedModule,
  ],
  exports: [
    SharedModule,
    HeaderComponent,
  ],
  declarations: [
    HeaderComponent,
  ],
  providers: [
    SettingService,
    TeamService,
    GameService,
    AuthService,
    PickService,
    AvatarService,
    CurrentWeekService,
    VerifyService,
    AuthGuard,
    RoleGuard,
    ActiveGuard,
    VerifyGuard,
    AlreadySigninGuard,
  ]
})
export class CoreModule { }
