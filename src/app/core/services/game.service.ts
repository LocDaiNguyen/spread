import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { Game } from '../../models/game.model';

@Injectable()
export class GameService {

  private gamesUrl = '/api/games';
  private headers = {headers: new Headers({'Content-Type': 'application/json', 'Accept': 'application/json'})};

  constructor(
    private http: Http
  ) { }

  getAllGames(): Observable<Game[]> {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const gamesUrl = `${this.gamesUrl}${token}`;
    return this.http.get(gamesUrl)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  getGame(gameId: string): Observable<Game> {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const gameUrl = `${this.gamesUrl}/${gameId}${token}`;
    return this.http.get(gameUrl)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  createGame(game: Game): Observable<Game> {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const gamesUrl = `${this.gamesUrl}${token}`;
    return this.http.post(gamesUrl, JSON.stringify(game), this.headers)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  updateGame(game: any): Observable<Game> {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const gameUrl = `${this.gamesUrl}/${game._id}${token}`;
    return this.http.patch(gameUrl, JSON.stringify(game), this.headers)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  updateSpread(game): Observable<Game> {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const gameUrl = `${this.gamesUrl}/${game._id}${token}`;
    return this.http.patch(gameUrl, JSON.stringify(game), this.headers)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

}
