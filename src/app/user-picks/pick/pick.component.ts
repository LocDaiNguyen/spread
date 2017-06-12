import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pick',
  templateUrl: './pick.component.html',
  styleUrls: ['./pick.component.css']
})
export class PickComponent implements OnInit {

  @Input() pick: any;

  constructor() { }

  ngOnInit() {
  }

}
