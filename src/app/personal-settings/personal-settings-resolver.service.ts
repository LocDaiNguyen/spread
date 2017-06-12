import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import * as jwtDecode from 'jwt-decode';

import { AuthService } from '../core/services/auth.service';
import { User } from '../models/user.model';

@Injectable()
export class PersonalSettingsResolver implements Resolve<User> {

  constructor(
    private authService: AuthService
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User> {

    const userId = localStorage.getItem('userId');
    if (userId) {
      return this.authService.getUser(userId);
    }
  }
}
