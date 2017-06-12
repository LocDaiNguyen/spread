import { Component, OnInit, Input } from '@angular/core';

import { PickDistributionVM } from '../../models/pick-distribution.vm';

@Component({
  selector: 'app-pd-away-team',
  templateUrl: './away-team.component.html',
  styleUrls: ['./away-team.component.css']
})
export class AwayTeamComponent implements OnInit {

  @Input() pickDist: PickDistributionVM;

  constructor() { }

  ngOnInit() {
  }

}
