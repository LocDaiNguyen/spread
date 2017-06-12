import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { Team } from '../../models/team.model';

@Injectable()
export class TeamService {

  private teamsUrl = 'api/teams';
  private headers = {headers: new Headers({'Content-Type': 'application/json', 'Accept': 'application/json'})};

  constructor(
    private http: Http
  ) { }

  getAllTeams(): Observable<Team[]> {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const teamsUrl = `${this.teamsUrl}${token}`;
    return this.http.get(teamsUrl)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

}
