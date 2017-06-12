import { Component, OnInit, Input } from '@angular/core';

import { PickDistributionVM } from '../../models/pick-distribution.vm';

@Component({
  selector: 'app-pd-picker',
  templateUrl: './picker.component.html',
  styleUrls: ['./picker.component.css']
})
export class PickerComponent implements OnInit {

  @Input() pickDist: PickDistributionVM;

  constructor() { }

  ngOnInit() {
  }

}
