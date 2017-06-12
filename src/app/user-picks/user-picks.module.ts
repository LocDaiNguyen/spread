import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { UserPicksRoutingModule } from './user-picks-routing.module';

import { UserPicksComponent } from './user-picks.component';
import { UserComponent } from './user/user.component';
import { PickComponent } from './pick/pick.component';
import { PickGameStartedComponent } from './pick-game-started/pick-game-started.component';
import { PickGameNotStartedComponent } from './pick-game-not-started/pick-game-not-started.component';

@NgModule({
  imports: [
    SharedModule,
    UserPicksRoutingModule
  ],
  declarations: [
    UserPicksComponent,
    UserComponent,
    PickComponent,
    PickGameStartedComponent,
    PickGameNotStartedComponent
  ]
})
export class UserPicksModule { }
