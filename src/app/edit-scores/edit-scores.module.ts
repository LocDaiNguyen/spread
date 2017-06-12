import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { EditScoresRoutingModule } from './edit-scores-routing.module';

import { EditScoresComponent } from './edit-scores.component';
import { MatchupComponent } from './matchup/matchup.component';

@NgModule({
  imports: [
    SharedModule,
    EditScoresRoutingModule
  ],
  declarations: [
    EditScoresComponent,
    MatchupComponent
  ]
})
export class EditScoresModule { }
