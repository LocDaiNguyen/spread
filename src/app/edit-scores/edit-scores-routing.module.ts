import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditScoresComponent } from './edit-scores.component';

const routes: Routes = [
  {
    path: '',
    component: EditScoresComponent
  },
  {
    path: ':id',
    component: EditScoresComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EditScoresRoutingModule {}
