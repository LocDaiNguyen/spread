import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { EditSpreadsRoutingModule } from './edit-spreads-routing.module';

import { EditSpreadsComponent } from './edit-spreads.component';
import { MatchupComponent } from './matchup/matchup.component';

@NgModule({
  imports: [
    SharedModule,
    EditSpreadsRoutingModule
  ],
  declarations: [
    EditSpreadsComponent,
    MatchupComponent
  ]
})
export class EditSpreadsModule { }
