import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pick-game-started',
  templateUrl: './pick-game-started.component.html',
  styleUrls: ['./pick-game-started.component.css']
})
export class PickGameStartedComponent implements OnInit {

  @Input() pick: any;

  constructor() { }

  ngOnInit() {
  }

}
