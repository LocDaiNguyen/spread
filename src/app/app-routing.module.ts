import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

import { AuthGuard } from './core/services/auth.guard';
import { RoleGuard } from './core/services/role.guard';
import { ActiveGuard } from './core/services/active.guard';
import { VerifyGuard } from './core/services/verify.guard';
import { AlreadySigninGuard } from './core/services/already-signin.guard';
import { SignInComponent } from './sign-in/sign-in.component';
import { AboutComponent } from './about/about.component';

const routes: Routes = [
  {
    path: 'make-picks',
    loadChildren: 'app/make-picks/make-picks.module#MakePicksModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'user-picks',
    loadChildren: 'app/user-picks/user-picks.module#UserPicksModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'standings',
    loadChildren: 'app/standings/standings.module#StandingsModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'pick-distributions',
    loadChildren: 'app/pick-distributions/pick-distributions.module#PickDistributionsModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'stats',
    loadChildren: 'app/stats/stats.module#StatsModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'personal-settings',
    loadChildren: 'app/personal-settings/personal-settings.module#PersonalSettingsModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-scores',
    loadChildren: 'app/edit-scores/edit-scores.module#EditScoresModule',
    canActivate: [RoleGuard]
  },
  {
    path: 'edit-spreads',
    loadChildren: 'app/edit-spreads/edit-spreads.module#EditSpreadsModule',
    canActivate: [RoleGuard]
  },
  {
    path: 'settings',
    loadChildren: 'app/settings/settings.module#SettingsModule',
    canActivate: [RoleGuard]
  },
  {
    path: 'users',
    loadChildren: 'app/users/users.module#UsersModule',
    canActivate: [RoleGuard]
  },
  {
    path: 'verifications',
    loadChildren: 'app/verifications/verifications.module#VerificationsModule',
    canActivate: [AlreadySigninGuard]
  },
  {
    path: 'passwords',
    loadChildren: 'app/passwords/passwords.module#PasswordsModule',
    canActivate: [AlreadySigninGuard]
  },
  {
    path: 'signup',
    loadChildren: 'app/sign-up/sign-up.module#SignUpModule',
    canActivate: [AlreadySigninGuard]
  },
  {
    path: 'signin',
    component: SignInComponent,
    canActivate: [AlreadySigninGuard]
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: '',
    component: AboutComponent
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
