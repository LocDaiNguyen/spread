import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MakePicksComponent } from './make-picks.component';

const routes: Routes = [
  {
    path: '',
    component: MakePicksComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MakePicksRoutingModule {}
