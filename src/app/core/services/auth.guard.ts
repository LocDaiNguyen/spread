import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';

import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isAuthenticated()) {
      if (this.authService.isVerify()) {
        if (this.authService.isActive()) {
          return true;
        } else {
          this.router.navigateByUrl('/verifications/deactive');
          return false;
        }
      } else {
        this.router.navigateByUrl('/verifications/verify');
        return false;
      }
    } else {
      this.router.navigateByUrl('/signin');
      return false;
    }
  }
}
