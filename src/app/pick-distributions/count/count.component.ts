import { Component, OnInit, Input } from '@angular/core';

import { PickDistributionVM } from '../../models/pick-distribution.vm';

@Component({
  selector: 'app-pd-count',
  templateUrl: './count.component.html',
  styleUrls: ['./count.component.css']
})
export class CountComponent implements OnInit {

  @Input() pickDist: PickDistributionVM;

  constructor() { }

  ngOnInit() {
  }

}
