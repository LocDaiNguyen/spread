import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PickDistributionsComponent } from './pick-distributions.component';

const routes: Routes = [
  {
    path: '',
    component: PickDistributionsComponent
  },
  {
    path: ':id',
    component: PickDistributionsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PickDistributionsRoutingModule {}
