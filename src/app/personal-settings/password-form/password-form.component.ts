import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormArrayName, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
declare const Materialize: any;

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-password-form',
  templateUrl: './password-form.component.html',
  styleUrls: ['./password-form.component.css']
})
export class PasswordFormComponent implements OnInit, AfterViewChecked {

  passwordForm: FormGroup;
  formSubmitted = false;
  formErrors = { password: '', passwordConfirm: '' };
  validationMessages = {
    password: {
      required: 'Password is required.',
      minlength: 'Password minimum length is 6 characters.',
      pattern: 'Password must contain one lowercase, one uppercase, one number and a special character.'
    },
    passwordConfirm: {
      required: 'Confirm password is required.',
    }
  };
  passwordError = false;
  successMsg: string;
  errorMsg: string;
  error = false;
  userId: string;



  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute
  ) { }



  ngOnInit(): void {
    this.buildForm();
    this.route.parent.data.subscribe(
      data => {
        this.userId = data.user._id;
      },
      error => this.error = true
    );
  }



  ngAfterViewChecked(): void {
    this.formChanged();
  }



  buildForm(): void {

    this.passwordForm = this.formBuilder.group({
      password: [null, [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern('(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[0-9a-zA-Z!@#$%^&*]{6,}')
      ]],
      passwordConfirm: [null, Validators.required]
    });
  }



  formChanged(): void {

    if (this.passwordForm.valueChanges) {
      this.passwordForm.valueChanges
        .subscribe(
          data => this.onValueChanged(data),
          error => console.error(error)
        );
    }
  }



  onValueChanged(data?: any): void {

    if (!this.passwordForm) { return; }

    const form: FormGroup = this.passwordForm;

    // tslint:disable-next-line:forin
    for (const field in this.formErrors) {

      if (field === 'passwordConfirm' && data.password !== null && data.passwordConfirm !== null) {
        this.checkPasswordMatch(data.password, data.passwordConfirm);
      }

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



  checkPasswordMatch(password: string, passwordConfirm: string): void {

    if (password !== '') {
      if (password !== passwordConfirm) {
        this.passwordError = false;
      } else {
        this.passwordError = true;
      }
    }
  }



  savePassword(): void {

    if (!this.passwordForm.valid) {

      this.formSubmitted = true;
      this.errorMsg = 'Form not valid';
      return;

    } else if (this.passwordForm.dirty && this.passwordForm.valid) {

      this.formSubmitted = true;
      this.errorMsg = '';

      const newPassword: any = {
        _id: this.userId,
        password: this.passwordForm.controls['password'].value,
      };

      this.authService.updateUserPassword(newPassword)
        .subscribe(
          user => {
            this.successMsg = 'Password UPDATED';
            this.passwordForm.reset();
          },
          error => this.errorMsg = error.message
        );
    }
  }




}
