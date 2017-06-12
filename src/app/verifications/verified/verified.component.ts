import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import 'rxjs/add/operator/switchMap';

import { VerifyService } from '../../core/services/verify.service';

@Component({
  selector: 'app-verified',
  templateUrl: './verified.component.html',
  styleUrls: ['./verified.component.css']
})
export class VerifiedComponent implements OnInit {

  linkExist: boolean;
  message: string;
  errorMsg: string;



  constructor(
    private verifyService: VerifyService,
    private route: ActivatedRoute
  ) { }



  ngOnInit() {
    this.verify();
  }



  verify(): void {
    this.route.params
      .switchMap((params: Params) => this.verifyService.getVerify(params['id']))
      .subscribe(
        verification => {
          this.message = verification.message;
          this.linkExist = verification.linkExist;
          this.verifyService.deleteVerify(verification._id)
            .subscribe(
              message => console.log(message),
              error => this.errorMsg = error.message
            );
        },
        error => {
          this.message = error.message;
          this.linkExist = error.linkExist;
        }
      );
  }



}
