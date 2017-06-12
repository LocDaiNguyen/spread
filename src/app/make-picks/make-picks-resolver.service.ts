import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Observable } from 'rxjs/Observable';

import { GameService } from '../core/services/game.service';
import { Game } from '../models/game.model';

@Injectable()
export class MakePicksResolver implements Resolve<Game[]> {

  constructor(
    private gameService: GameService
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Game[]> {

    return this.gameService.getAllGames();


  }
}
