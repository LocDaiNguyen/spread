import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent implements OnInit {

  @Input() userName: string;
  @Input() avatar: string;
  @Input() rank: number;
  @Input() points: number;
  @Input() rankText: string;

  constructor() { }

  ngOnInit() {
  }

}
