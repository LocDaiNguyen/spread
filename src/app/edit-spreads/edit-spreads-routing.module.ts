import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditSpreadsComponent } from './edit-spreads.component';

const routes: Routes = [
  {
    path: '',
    component: EditSpreadsComponent
  },
  {
    path: ':id',
    component: EditSpreadsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EditSpreadsRoutingModule {}
