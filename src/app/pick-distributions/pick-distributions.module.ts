import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { PickDistributionsRoutingModule } from './pick-distributions-routing.module';

import { PickDistributionsComponent } from './pick-distributions.component';
import { AwayTeamComponent } from './away-team/away-team.component';
import { HomeTeamComponent } from './home-team/home-team.component';
import { CountComponent } from './count/count.component';
import { BarComponent } from './bar/bar.component';
import { PickerComponent } from './picker/picker.component';
import { PickDistComponent } from './pick-dist/pick-dist.component';

@NgModule({
  imports: [
    SharedModule,
    PickDistributionsRoutingModule
  ],
  declarations: [
    PickDistributionsComponent,
    AwayTeamComponent,
    HomeTeamComponent,
    CountComponent,
    BarComponent,
    PickerComponent,
    PickDistComponent
  ]
})
export class PickDistributionsModule { }
