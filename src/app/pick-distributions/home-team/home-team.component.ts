import { Component, OnInit, Input } from '@angular/core';

import { PickDistributionVM } from '../../models/pick-distribution.vm';

@Component({
  selector: 'app-pd-home-team',
  templateUrl: './home-team.component.html',
  styleUrls: ['./home-team.component.css']
})
export class HomeTeamComponent implements OnInit {

  @Input() pickDist: PickDistributionVM;

  constructor() { }

  ngOnInit() {
  }

}
