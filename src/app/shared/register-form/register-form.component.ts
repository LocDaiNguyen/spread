import { Component, OnInit, AfterViewChecked, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormArrayName, FormControl, Validators } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/first';
declare const Materialize: any;

import { User } from '../../models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { SettingService } from '../../core/services/setting.service';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css']
})
export class RegisterFormComponent implements OnInit, AfterViewChecked {

  regForm: FormGroup;
  formSubmitted = false;
  formErrors = { userName: '', email: '', password: '', passwordConfirm: '', firstName: '', lastName: ''};
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
    password: {
      required: 'Password is required.',
      minlength: 'Password minimum length is 6 characters.',
      pattern: 'Password must contain one lowercase, one uppercase, one number and a special character.'
    },
    passwordConfirm: {
      required: 'Password confirm is required.'
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
  passwordError = false;
  errorMsg: string;

  @Input() title: string;
  @Input() description: string;
  @Output() createdUserEE = new EventEmitter();



  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) { }



  ngOnInit() {
    this.buildForm();
  }



  ngAfterViewChecked(): void {
    this.formChanged();
  }



  buildForm(): void {

    this.regForm = this.formBuilder.group({
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
      password: [null, [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern('(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[0-9a-zA-Z!@#$%^&*]{6,}')
      ]],
      passwordConfirm: [null, Validators.required],
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



  formChanged(): void {

    if (this.regForm.valueChanges) {
      this.regForm.valueChanges
        .subscribe(
          data => this.onValueChanged(data),
          error => console.error(error)
        );
    }
  }



  onValueChanged(data?: any): void {

    if (!this.regForm) { return; }

    const form: FormGroup = this.regForm;

    // tslint:disable-next-line:forin
    for (const field in this.formErrors) {

      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control: any = form.get(field);

      if (field === 'passwordConfirm' && data.password !== null && data.passwordConfirm !== null) {
        this.checkPasswordMatch(data.password, data.passwordConfirm);
      }

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
            const userNameExist = users.filter(user => user.userName === control.value);
            if (userNameExist.length > 0) {
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
            const emailExist = users.filter(user => user.email === control.value);
            if (emailExist.length > 0) {
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



  checkPasswordMatch(password: string, passwordConfirm: string): boolean {

    if (password !== '') {
      if (password !== passwordConfirm) {
        return this.passwordError = false;
      } else {
        return this.passwordError = true;
      }
    }
  }



  saveUser(): void {

    if (!this.regForm.valid) {

      this.formSubmitted = true;
      this.errorMsg = 'Form not valid';
      return;

    } else if (this.regForm.dirty && this.regForm.valid) {

      this.formSubmitted = true;
      this.errorMsg = '';

      const newUser: User = {
        userName: this.regForm.controls['userName'].value,
        email: this.regForm.controls['email'].value,
        password: this.regForm.controls['password'].value,
        firstName: this.regForm.controls['firstName'].value,
        lastName: this.regForm.controls['lastName'].value,
        active: false,
        verify: false,
        avatar: 'atlph',
        paid: false
      };

      this.authService.createUser(newUser)
        .subscribe(
          user => {
            this.createdUserEE.emit(user);
            this.resetValues();
          },
          error => this.errorMsg = error.message
        );
    }
  }




  cancel(): void {
    this.resetValues();
  }




  resetValues(): void {

    this.formSubmitted = false;
    this.regForm.reset();
  }




}
