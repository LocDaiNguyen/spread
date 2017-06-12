import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { tokenNotExpired } from 'angular2-jwt';
import * as jwtDecode from 'jwt-decode';

import { User } from '../../models/user.model';

@Injectable()
export class AuthService {

  private usersUrl = '/api/users';
  private headers = {headers: new Headers({'Content-Type': 'application/json', 'Accept': 'application/json'})};

  constructor(
    private http: Http
  ) { }

  getAllUsers(): Observable<User[]> {
    return this.http.get(this.usersUrl)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  getUser(userId: string): Observable<User> {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const userUrl = `${this.usersUrl}/${userId}${token}`;
    return this.http.get(userUrl)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  createUser(user: User): Observable<User> {
    return this.http.post(this.usersUrl, JSON.stringify(user), this.headers)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  updateUser(user: any): Observable<User> {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const userUrl = `${this.usersUrl}/${user._id}${token}`;
    return this.http.patch(userUrl, JSON.stringify(user), this.headers)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  updateUserStatus(user: any): Observable<User> {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const userUrl = `${this.usersUrl}/${user._id}/status/${token}`;
    return this.http.patch(userUrl, JSON.stringify(user), this.headers)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  updateUserAccount(user: any): Observable<User> {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const userUrl = `${this.usersUrl}/${user._id}/account/${token}`;
    return this.http.patch(userUrl, JSON.stringify(user), this.headers)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  updateUserAvatar(user: any): Observable<User> {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const userUrl = `${this.usersUrl}/${user._id}/avatar/${token}`;
    return this.http.patch(userUrl, JSON.stringify(user), this.headers)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  updateUserPassword(user: any): Observable<User> {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const userUrl = `${this.usersUrl}/${user._id}/password/${token}`;
    return this.http.patch(userUrl, JSON.stringify(user), this.headers)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  deleteUser(user: any): Observable<User> {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const userUrl = `${this.usersUrl}/${user._id}${token}`;
    return this.http.delete(userUrl, this.headers)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  signIn(credentials: any): Observable<any> {
    const signInUrl = `${this.usersUrl}/signin`;
    return this.http.post(signInUrl, JSON.stringify(credentials), this.headers)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  requestPassword(email: string): Observable<any> {
    const resetUrl = `${this.usersUrl}/request-reset-password`;
    return this.http.post(resetUrl, JSON.stringify(email), this.headers)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  resetPassword(user: any): Observable<any> {
    const resetUrl = `${this.usersUrl}/${user._id}/reset-password`;
    return this.http.patch(resetUrl, JSON.stringify(user), this.headers)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  logout() {
    localStorage.clear();
  }

  isAuthenticated(): boolean {
    return tokenNotExpired('token');
  }

  isAdmin(): boolean {
    return jwtDecode(localStorage.getItem('token')).scope === 'admin';
  }

  isActive(): boolean {
    return jwtDecode(localStorage.getItem('token')).active;
  }

  isVerify(): boolean {
    return jwtDecode(localStorage.getItem('token')).verify;
  }

}
