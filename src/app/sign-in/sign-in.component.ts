import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormArrayName, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

declare const Materialize: any;

import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {

  signinForm: FormGroup;
  formSubmitted = false;
  errorMsg: string;

  constructor(
    private router: Router,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {

    this.signinForm = this.formBuilder.group({
      userNameOrEmail: [null, [Validators.required]],
      password: [null, [Validators.required]]
    });
  }

  signin(): void {

    if (!this.signinForm.valid) {

      this.formSubmitted = true;
      this.errorMsg = 'Please enter credentials';
      return;

    } else if (this.signinForm.dirty && this.signinForm.valid) {

      this.formSubmitted = true;
      this.errorMsg = '';

      const userCred = {
        userNameOrEmail: this.signinForm.controls['userNameOrEmail'].value,
        password: this.signinForm.controls['password'].value
      };

      this.authService.signIn(userCred)
        .subscribe(
          user => {
            localStorage.setItem('token', user.token);
            localStorage.setItem('userId', user.userId);
            this.signinForm.reset();
            this.router.navigateByUrl('/make-picks');
          },
          error => {
            this.errorMsg = error.message;
            console.log(error.verified);
            if (error.verified === false) {
              this.router.navigateByUrl('/verifications/verify');
            }
          }
        );
    }
  }

}
