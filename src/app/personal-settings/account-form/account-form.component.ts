import { Component, OnInit, AfterViewChecked, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormArrayName, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/first';
declare const Materialize: any;

import { User } from '../../models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { SettingService } from '../../core/services/setting.service';

@Component({
  selector: 'app-account-form',
  templateUrl: './account-form.component.html',
  styleUrls: ['./account-form.component.css']
})
export class AccountFormComponent implements OnInit, AfterViewChecked {

  user: User;
  settingsForm: FormGroup;
  formSubmitted = false;
  formErrors = { userName: '', email: '', firstName: '', lastName: ''};
  validationMessages = {
    userName: {
      required: 'Username is required.',
      minlength: 'Username must be at least 3 characters long.',
      maxlength: 'Username cannot be more than 12 characters long.',
      pattern: 'Username must include only alpha numeric characters, numbers and symbols.',
      exist: 'Username already exist.'
    },
    email: {
      required: 'Email is required.',
      pattern: 'Email is not valid.',
      exist: 'Email already exist.'
    },
    firstName: {
      required: 'First name is required.',
      minlength: 'First name must be at least 2 characters long.'
    },
    lastName: {
      required: 'Last name is required.',
      minlength: 'Last name must be at least 2 characters long.'
    }
  };
  successMsg: string;
  errorMsg: string;
  error = false;



  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute
  ) { }



  ngOnInit() {
    
    this.buildForm();
    
    this.route.parent.data.subscribe(
      data => {
        this.user = data.user;
        console.log(this.user);
        this.addUserToFormGroup(data.user);
      },
      error => this.error = true
    );
  }



  ngAfterViewChecked(): void {
    this.formChanged();
  }



  buildForm(): void {

    this.settingsForm = this.formBuilder.group({
      userName: [null, [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(12),
        Validators.pattern('[a-zA-Z0-9!@#$%^&*]+')
      ], this.checkUserNameExist.bind(this) ],
      email: [null, [
        Validators.required,
        Validators.pattern('[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?')
      ], this.checkEmailExist.bind(this) ],
      firstName: [null, [
        Validators.required,
        Validators.minLength(2)
      ]],
      lastName: [null, [
        Validators.required,
        Validators.minLength(2)
      ]]
    });
  }



  addUserToFormGroup(user: User): void {
    
    this.settingsForm.patchValue({
      userName: user.userName,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });
  }



  formChanged(): void {

    if (this.settingsForm.valueChanges) {
      this.settingsForm.valueChanges
        .subscribe(
          data => this.onValueChanged(data),
          error => console.error(error)
        );
    }
  }



  onValueChanged(data?: any): void {

    if (!this.settingsForm) { return; }

    const form: FormGroup = this.settingsForm;

    // tslint:disable-next-line:forin
    for (const field in this.formErrors) {

      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control: any = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages: string = this.validationMessages[field];
        // tslint:disable-next-line:forin
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }



  checkUserNameExist(control: FormControl): Observable<any> {

    const observable = new Observable(obs => {
      this.authService.getAllUsers()
        .subscribe(
          (users: User[]) => {
            const userNameExist: User = users.find(user => user.userName === control.value);
            if (userNameExist && userNameExist.userName !== this.user.userName) {
              obs.next({exist: true});
              this.formErrors.userName += this.validationMessages.userName.exist + ' ';
            } else {
              obs.next(null);
            }
          }
        );
    });
    return observable.debounceTime(500).distinctUntilChanged().first();
  }



  checkEmailExist(control: FormControl): Observable<any> {

    const observable = new Observable(obs => {
      this.authService.getAllUsers()
        .subscribe(
          (users: User[]) => {
            const emailExist: User = users.find(user => user.email === control.value);
            if (emailExist && emailExist.email !== this.user.email) {
              obs.next({exist: true});
              this.formErrors.email += this.validationMessages.email.exist + ' ';
            } else {
              obs.next(null);
            }
          }
        );
    });
    return observable.debounceTime(500).distinctUntilChanged().first();
  }



  saveUser(): void {

    if (
      this.settingsForm.controls['userName'].value === this.user.userName &&
      this.settingsForm.controls['email'].value === this.user.email &&
      this.settingsForm.controls['firstName'].value === this.user.firstName &&
      this.settingsForm.controls['lastName'].value === this.user.lastName
    ) {
      this.formSubmitted = true;
      this.errorMsg = 'Values are the same';
      return;
    }

    if (!this.settingsForm.valid) {

      this.formSubmitted = true;
      this.errorMsg = 'Form not valid';
      return;

    } else if (this.settingsForm.dirty && this.settingsForm.valid) {

      this.formSubmitted = true;
      this.errorMsg = '';

      const updatedUser: any = {
        _id: this.user._id,
        userName: this.settingsForm.controls['userName'].value,
        email: this.settingsForm.controls['email'].value,
        firstName: this.settingsForm.controls['firstName'].value,
        lastName: this.settingsForm.controls['lastName'].value,
      };

      this.authService.updateUserAccount(updatedUser)
        .subscribe(
          user => {
            this.user = user;
            this.addUserToFormGroup(user);
            this.successMsg = 'Account UPDATED';
          },
          error => this.errorMsg = error.message
        );
    }
  }



}
