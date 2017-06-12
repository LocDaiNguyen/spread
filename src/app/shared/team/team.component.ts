import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { GamePickVM } from '../../models/game-pick.vm';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit {

  @Input() type: string;
  @Input() team: string;
  @Input() _id: string;
  @Input() abbr: string;
  @Input() city: string;
  @Input() name: string;
  @Input() spread: string;
  @Input() score: number;
  @Input() isPicked: boolean;
  @Input() isDisabled: boolean;
  @Input() isGameStarted: boolean;
  @Input() teamControl: FormGroup;

  @Output() checkboxChangedEE = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  checkboxChanged(checked: boolean, gameId: string, team: string): void {
    this.checkboxChangedEE.emit({checked, gameId, team});
  }

}
