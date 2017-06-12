import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { Avatar } from '../../models/avatar.model';

@Injectable()
export class AvatarService {

  private avatarsUrl = 'api/avatars';
  private headers = {headers: new Headers({'Content-Type': 'application/json', 'Accept': 'application/json'})};

  constructor(
    private http: Http
  ) { }

  getAllAvatars(): Observable<Avatar[]> {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const avatarsUrl = `${this.avatarsUrl}${token}`;
    return this.http.get(avatarsUrl)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  createAvatar(avatar: Avatar): Observable<Avatar> {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const avatarsUrl = `${this.avatarsUrl}${token}`;
    return this.http.post(avatarsUrl, JSON.stringify(avatar), this.headers)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  updateAvatar(avatar): Observable<Avatar> {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const avatarUrl = `${this.avatarsUrl}/${avatar._id}${token}`;
    return this.http.patch(avatarUrl, JSON.stringify(avatar), this.headers)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  deleteAvatar(avatar: Avatar): Observable<Avatar> {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const avatarUrl = `${this.avatarsUrl}/${avatar._id}${token}`;
    return this.http.delete(avatarUrl, this.headers)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

}
