import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { GamePickVM } from '../../models/game-pick.vm';

@Component({
  selector: 'app-esp-matchup',
  templateUrl: './matchup.component.html',
  styleUrls: ['./matchup.component.css']
})
export class MatchupComponent implements OnInit {

  @Input() game: GamePickVM;
  @Input() control: FormGroup;

  @Output() checkboxChangedEE = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  checkboxChanged(event) {
    this.checkboxChangedEE.emit(event);
  }

}
