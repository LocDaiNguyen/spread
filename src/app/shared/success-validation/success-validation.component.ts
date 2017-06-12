import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-success-validation',
  templateUrl: './success-validation.component.html',
  styleUrls: ['./success-validation.component.css']
})
export class SuccessValidationComponent implements OnInit {

  @Input() successMsg: string;

  constructor() { }

  ngOnInit() {
  }

}
