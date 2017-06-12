import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-user-picks-all',
  templateUrl: './user-picks-all.component.html',
  styleUrls: ['./user-picks-all.component.css']
})
export class UserPicksAllComponent implements OnInit {

  @Input() picks: any;

  constructor() { }

  ngOnInit() {
  }

}
