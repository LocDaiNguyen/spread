import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormArrayName, FormControl, Validators } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
declare const Materialize: any;

import { User } from '../models/user.model';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  usersForm: FormGroup;
  users: User[];
  title = 'Add User';
  description = 'Add a new user to the pool.';
  successMsg: string;
  errorMsg: string;
  error = false;
  noData = false;




  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) { }




  ngOnInit(): void {

    this.getAllUsers();

    this.usersForm = this.formBuilder.group({
      users: this.formBuilder.array([])
    });
  }




  getAllUsers(): void {

    this.authService.getAllUsers()
      .subscribe(
        users => {
          if (users.length === 0) {
            this.noData = true;
          }
          this.users = this.orderUsers(users);
          this.mapUsers(this.users);
        },
        error => this.error = true
      );
  }



  orderUsers(users: User[]): User[] {

    if (users.length === 0) {
      return [];
    }

    const usersSorted = users.sort((userCurr, userNext) => {
      const nameCurr = userCurr.userName.toUpperCase();
      const nameNext = userNext.userName.toUpperCase();
      if (nameCurr < nameNext) {
        return - 1;
      }
      if (nameCurr > nameNext) {
        return 1;
      }
      return 0;
    });

    return usersSorted;
  }



  mapUsers(users: User[]): void {

    users.map(user => {
      this.addUserToFormGroup(user._id, user.verify, user.active, user.paid);
    });
  }



  addUserToFormGroup(
    userId: string,
    verify: boolean,
    active: boolean,
    paid: boolean
  ): void {

    const control = <FormArray>this.usersForm.controls['users'];

    control.push(
      this.formBuilder.group({
        userId: [userId, Validators.required],
        verify: [verify, Validators.required],
        active: [active, Validators.required],
        paid: [paid, Validators.required],
      })
    );
  }



  newUser(user: User): void {
    // this.users.splice(this.users.length, 0, user);
    // this.users = this.users.slice();
    this.users = [...this.users, user];
  }



  saveUsers(): void {

    if (!this.usersForm.dirty) {
      Materialize.toast('No changes to users form', 8000, 'orange');
      return;
    }

    const usersWithUpdatedValues = this.grabUsersWithUpdatedValues();

    usersWithUpdatedValues.map(user =>
      this.authService.updateUserStatus(user)
        .subscribe(
          rUser => this.successMsg = 'User status UPDATED',
          error => this.errorMsg = error.message
        )
    );
  }



  grabUsersWithUpdatedValues(): any[] {

    const mappedUsers: any[] = this.usersForm.controls['users'].value.map((user, i) => {

      const control: any = this.usersForm.controls['users'];

      if (!control.controls[i].dirty) {
        return;
      }

      return {
        userId: user.userId,
        verify: user.verify,
        active: user.active,
        paid: user.paid,
      };
    });

    const usersWithUpdatedValues = mappedUsers.filter(user => !!user);
    console.log(usersWithUpdatedValues);

    return usersWithUpdatedValues;
  }



  deleteUser(user: User): void {

    this.authService.deleteUser(user)
      .subscribe(
        rUser => {
          this.users = this.users.filter(fUser => fUser._id !== rUser._id);
          this.successMsg = `${rUser.userName} DELETED`;
          // Materialize.toast(`${rUser.userName} DELETED`, 8000, 'teal');
        },
        error => this.errorMsg = error.message
      );
  }




}
