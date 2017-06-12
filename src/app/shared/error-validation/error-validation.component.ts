import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-error-validation',
  templateUrl: './error-validation.component.html',
  styleUrls: ['./error-validation.component.css']
})
export class ErrorValidationComponent implements OnInit {

  @Input() errorMsg: string;

  constructor() { }

  ngOnInit() {
  }

}
