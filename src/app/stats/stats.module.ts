import { NgModule } from '@angular/core';

import { NgxChartsModule } from '@swimlane/ngx-charts';

import { SharedModule } from '../shared/shared.module';
import { StatsRoutingModule } from './stats-routing.module';

import { StatsComponent } from './stats.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { UserPicksAllComponent } from './user-picks-all/user-picks-all.component';

@NgModule({
  imports: [
    SharedModule,
    NgxChartsModule,
    StatsRoutingModule
  ],
  declarations: [
    StatsComponent,
    UserInfoComponent,
    UserPicksAllComponent
  ]
})
export class StatsModule { }
