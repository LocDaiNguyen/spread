import { Component, OnInit, Input } from '@angular/core';

import { PickDistributionVM } from '../../models/pick-distribution.vm';

@Component({
  selector: 'app-pd-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.css']
})
export class BarComponent implements OnInit {

  @Input() pickDist: PickDistributionVM;

  constructor() { }

  ngOnInit() {
  }

}
