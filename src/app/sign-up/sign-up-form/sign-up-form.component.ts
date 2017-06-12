import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up-form',
  templateUrl: './sign-up-form.component.html',
  styleUrls: ['./sign-up-form.component.css']
})
export class SignUpFormComponent implements OnInit {

  title = 'Sign Up';
  description = 'Fill in form below to sign up.';

  constructor(
    private router: Router
  ) {}

  ngOnInit() {}

  redirect() {
    this.router.navigateByUrl('/signup/success');
  }

}
