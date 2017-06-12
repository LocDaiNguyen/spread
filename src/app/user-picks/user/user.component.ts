import { Component, OnInit, Input } from '@angular/core';

import { UserInfoPickVM } from 'app/models/user-info-pick.vm';

@Component({
  selector: 'app-up-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  @Input() user: UserInfoPickVM;

  constructor() { }

  ngOnInit() {
  }

  trackUserPicks(index: number, pick: any): string | undefined {
    return pick ? pick._id : undefined;
  }

}
