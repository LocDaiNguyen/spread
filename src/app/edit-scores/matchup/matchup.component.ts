import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { GamePickVM } from '../../models/game-pick.vm';

@Component({
  selector: 'app-esc-matchup',
  templateUrl: './matchup.component.html',
  styleUrls: ['./matchup.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
