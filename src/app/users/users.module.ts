import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { UsersRoutingModule } from './users-routing.module';

import { UsersComponent } from './users.component';
import { UsersListComponent } from './users-list/users-list.component';

@NgModule({
  imports: [
    SharedModule,
    UsersRoutingModule
  ],
  declarations: [
    UsersComponent,
    UsersListComponent,
  ]
})
export class UsersModule { }
