import { Component, OnInit, Input } from '@angular/core';

import { StandingVM } from '../../models/standing.vm';

@Component({
  selector: 'app-s-standing',
  templateUrl: './standing.component.html',
  styleUrls: ['./standing.component.css']
})
export class StandingComponent implements OnInit {

  @Input() standing: StandingVM;
  @Input() last: boolean;

  constructor() { }

  ngOnInit() {
  }

}
