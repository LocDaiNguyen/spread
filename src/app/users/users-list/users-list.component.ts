import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { MaterializeDirective, MaterializeAction } from 'angular2-materialize';

import { User } from '../../models/user.model';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {

  userModalActions = new EventEmitter<string|MaterializeAction>();

  @Input() user: User;
  @Input() control: FormGroup;
  @Input() last: boolean;
  @Output() deleted = new EventEmitter();




  constructor() { }




  ngOnInit(): void {
  }



  openModal() {
    this.userModalActions.emit({action: 'modal', params: ['open']});
  }
  closeModal() {
    this.userModalActions.emit({action: 'modal', params: ['close']});
  }



  deleteUser(user: User): void {
    this.deleted.emit(user);
    this.closeModal();
  }




  trackUser(index: number, user: User): string | undefined {
    return user ? user._id : undefined;
  }





}
