import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { MakePicksRoutingModule } from './make-picks-routing.module';

import { MakePicksComponent } from './make-picks.component';
import { MatchupComponent } from './matchup/matchup.component';

@NgModule({
  imports: [
    SharedModule,
    MakePicksRoutingModule
  ],
  declarations: [
    MakePicksComponent,
    MatchupComponent
  ],
})
export class MakePicksModule { }
