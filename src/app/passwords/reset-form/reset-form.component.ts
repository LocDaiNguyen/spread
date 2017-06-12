import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormArrayName, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
declare const Materialize: any;

import { User } from '../../models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { VerifyService } from '../../core/services/verify.service';

@Component({
  selector: 'app-reset-form',
  templateUrl: './reset-form.component.html',
  styleUrls: ['./reset-form.component.css']
})
export class ResetFormComponent implements OnInit, AfterViewChecked {

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
  errorMsg: string;
  userId: string;
  verificationId: string;
  linkExist: boolean;



  constructor(
    private verifyService: VerifyService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) { }



  ngOnInit() {
    this.verify();
    this.buildForm();
  }



  verify(): void {

    this.route.params
      .switchMap((param: Params) => this.verifyService.getVerify(param['id']))
      .subscribe(
        verification => {
          this.linkExist = verification.linkExist;
          this.authService.getUser(verification.userId)
            .subscribe(
              user => this.userId = user._id,
              error => this.errorMsg = error.message
            );
        },
        error => this.linkExist = error.linkExist
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

      this.authService.resetPassword(newPassword)
        .subscribe(
          user => {
            this.passwordForm.reset();
            this.router.navigate(['/passwords/success'], {queryParams: {from: 'reset'}});
          },
          error => this.errorMsg = error
        );
    }
  }




}
