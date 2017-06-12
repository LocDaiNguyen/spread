import { Component, OnInit, Input } from '@angular/core';

import { PickDistributionVM } from '../../models/pick-distribution.vm';

@Component({
  selector: 'app-pd-pick-dist',
  templateUrl: './pick-dist.component.html',
  styleUrls: ['./pick-dist.component.css']
})
export class PickDistComponent implements OnInit {

  @Input() pickDist: PickDistributionVM;
  @Input() last: boolean;

  constructor() { }

  ngOnInit() {
  }

}
