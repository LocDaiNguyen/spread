import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormArrayName, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
declare const Materialize: any;

import { User } from '../../models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { VerifyService } from '../../core/services/verify.service';

@Component({
  selector: 'app-resend-form',
  templateUrl: './resend-form.component.html',
  styleUrls: ['./resend-form.component.css']
})
export class ResendFormComponent implements OnInit, AfterViewChecked {

  resendForm: FormGroup;
  formSubmitted = false;
  formErrors = { email: '' };
  validationMessages = {
    email: {
      required: 'Email is required.',
      pattern: 'Email is not valid.',
      doesNotExist: 'Email does not exist.'
    }
  };
  errorMsg: string;



  constructor(
    private authService: AuthService,
    private verifyService: VerifyService,
    private formBuilder: FormBuilder,
    private router: Router
  ) { }



  ngOnInit(): void {
    this.buildForm();
  }



  ngAfterViewChecked(): void {
    this.formChanged();
  }



  buildForm(): void {

    this.resendForm = this.formBuilder.group({
      email: [null, [
        Validators.required,
        Validators.pattern('[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?')
      ], this.checkEmailExist.bind(this) ]
    });
  }



  formChanged(): void {

    if (this.resendForm.valueChanges) {
      this.resendForm.valueChanges
        .subscribe(
          data => this.onValueChanged(data),
          error => console.error(error)
        );
    }
  }



  onValueChanged(data?: any): void {

    if (!this.resendForm) { return; }

    const form: FormGroup = this.resendForm;

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



  checkEmailExist(control: FormControl): Observable<any> {

    const observable = new Observable(obs => {
      this.authService.getAllUsers()
        .subscribe(
          (users: User[]) => {
            const emailExist: User = users.find(user => user.email === control.value);
            if (!emailExist) {
              obs.next({doesNotExist: true});
              this.formErrors.email += this.validationMessages.email.doesNotExist + ' ';
            } else {
              obs.next(null);
            }
          }
        );
    });
    return observable.debounceTime(500).distinctUntilChanged().first();
  }



  resendVerification(): void {

    if (!this.resendForm.valid) {

      this.formSubmitted = true;
      this.errorMsg = 'Form not valid';
      return;

    } else if (this.resendForm.dirty && this.resendForm.valid) {

      this.formSubmitted = true;
      this.errorMsg = '';

      const email: any = {
        email: this.resendForm.controls['email'].value,
      };

      this.verifyService.createVerify(email)
        .subscribe(
          message => {
            this.resendForm.reset();
            this.router.navigateByUrl('/verifications/success');
          },
          error => this.errorMsg = error.message
        );
    }
  }




}
