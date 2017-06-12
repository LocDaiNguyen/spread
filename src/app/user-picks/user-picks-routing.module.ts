import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserPicksComponent } from './user-picks.component';

const routes: Routes = [
  {
    path: '',
    component: UserPicksComponent
  },
  {
    path: ':id',
    component: UserPicksComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserPicksRoutingModule {}
