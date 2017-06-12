import { Injectable } from '@angular/core';

import { Game } from '../../models/game.model';

@Injectable()
export class CurrentWeekService {

  constructor() { }

  getCurrentWeek(games: Game[]): number {

    if (games.length === 0) {
      return 1;
    }

    const adjustedTime = 36; /*start the next week x(ex.36hrs) hours before the first game of that week*/
    const adjustedCurrentTime = new Date().setHours(new Date().getHours() - adjustedTime);
    let game = games.find((g: Game) => new Date(g.gameTimeEastern).getTime() > adjustedCurrentTime);
    if (!game) {
      game = games[games.length - 1];
    }

    return game.weekNum;
  }




}
