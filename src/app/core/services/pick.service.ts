import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { Pick } from '../../models/pick.model';

@Injectable()
export class PickService {

  private picksUrl = 'api/picks';
  private headers = {headers: new Headers({'Content-Type': 'application/json', 'Accept': 'application/json'})};

  constructor(
    private http: Http
  ) { }

  getAllPicks(): Observable<Pick[]> {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const picksUrl = `${this.picksUrl}${token}`;
    return this.http.get(picksUrl)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  getPick(pickId: string): Observable<Pick> {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const pickUrl = `${this.picksUrl}/${pickId}${token}`;
    return this.http.get(pickUrl)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  createPick(pick: Pick): Observable<Pick> {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const picksUrl = `${this.picksUrl}${token}`;
    return this.http.post(picksUrl, JSON.stringify(pick), this.headers)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  deletePick(pick: Pick): Observable<Pick> {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const pickUrl = `${this.picksUrl}/${pick._id}${token}`;
    return this.http.delete(pickUrl, this.headers)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

}
