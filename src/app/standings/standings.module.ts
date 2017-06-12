import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { StandingsRoutingModule } from './standings-routing.module';

import { StandingsComponent } from './standings.component';
import { StandingComponent } from './standing/standing.component';

@NgModule({
  imports: [
    SharedModule,
    StandingsRoutingModule
  ],
  declarations: [
    StandingsComponent,
    StandingComponent
  ]
})
export class StandingsModule { }
