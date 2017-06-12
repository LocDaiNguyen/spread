import { Component, OnInit } from '@angular/core';

import { MaterializeDirective, MaterializeAction } from 'angular2-materialize';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(
    public authService: AuthService
  ) { }

  ngOnInit() {
  }

  logout(): void {
    this.authService.logout();
  }

}
