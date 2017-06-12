import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormArrayName, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
declare const Materialize: any;

import { User } from '../../models/user.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-request-form',
  templateUrl: './request-form.component.html',
  styleUrls: ['./request-form.component.css']
})
export class RequestFormComponent implements OnInit, AfterViewChecked {

  resetPasswordForm: FormGroup;
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
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) { }



  ngOnInit(): void {
    this.buildForm();
  }



  ngAfterViewChecked(): void {
    this.formChanged();
  }



  buildForm(): void {

    this.resetPasswordForm = this.formBuilder.group({
      email: [null, [
        Validators.required,
        Validators.pattern('[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?')
      ], this.checkEmailExist.bind(this) ]
    });
  }



  formChanged(): void {

    if (this.resetPasswordForm.valueChanges) {
      this.resetPasswordForm.valueChanges
        .subscribe(
          data => this.onValueChanged(data),
          error => console.error(error)
        );
    }
  }



  onValueChanged(data?: any): void {

    if (!this.resetPasswordForm) { return; }

    const form: FormGroup = this.resetPasswordForm;

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



  resetPassword(): void {

    if (!this.resetPasswordForm.valid) {

      this.formSubmitted = true;
      this.errorMsg = 'Form not valid';
      return;

    } else if (this.resetPasswordForm.dirty && this.resetPasswordForm.valid) {

      this.formSubmitted = true;
      this.errorMsg = '';

      const email: any = {
        email: this.resetPasswordForm.controls['email'].value,
      };

      this.authService.requestPassword(email)
        .subscribe(
          message => {
            this.resetPasswordForm.reset();
            this.router.navigate(['/passwords/success'], {queryParams: {from: 'request'}});
          },
          error => this.errorMsg = error.message
        );
    }
  }




}
