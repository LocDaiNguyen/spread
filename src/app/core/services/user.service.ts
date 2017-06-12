import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { User } from '../../models/user.model';

@Injectable()
export class UserService {

  private usersUrl = 'api/users';
  private headers = {headers: new Headers({'Content-Type': 'application/json', 'Accept': 'application/json'})};

  constructor(
    private http: Http
  ) { }

  getAllUsers(): Observable<User[]> {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const usersUrl = `${this.usersUrl}${token}`;
    return this.http.get(usersUrl)
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
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const usersUrl = `${this.usersUrl}${token}`;
    return this.http.post(usersUrl, JSON.stringify(user), this.headers)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  updateUser(user): Observable<User> {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const userUrl = `${this.usersUrl}/${user._id}${token}`;
    return this.http.patch(userUrl, JSON.stringify(user), this.headers)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  deleteUser(user: User): Observable<User> {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const userUrl = `${this.usersUrl}/${user._id}${token}`;
    return this.http.delete(userUrl, this.headers)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

}
