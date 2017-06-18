import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { Game } from '../models/game.model';
import { GameService } from '../core/services/game.service';
import { User } from '../models/user.model';
import { AuthService } from '../core/services/auth.service';
import { Pick } from '../models/pick.model';
import { PickService } from '../core/services/pick.service';
import { StandingVM } from '../models/standing.vm';
import { RecordVM } from '../models/record.vm';


@Component({
  selector: 'app-standings',
  templateUrl: './standings.component.html',
  styleUrls: ['./standings.component.css']
})
export class StandingsComponent implements OnInit {

  standingsVM: StandingVM[];
  games: Game[];
  users: User[];
  picks: Pick[];
  error = false;
  noData = false;



  constructor(
    private gameService: GameService,
    private authService: AuthService,
    private pickService: PickService
  ) { }



  ngOnInit(): void {
    this.getAllData();
  }



  getAllData(): void {

    const games$: Observable<Game[]> = this.gameService.getAllGames();
    const users$: Observable<User[]> = this.authService.getAllUsers();
    const picks$: Observable<Pick[]> = this.pickService.getAllPicks();

    Observable.forkJoin([games$, users$, picks$])
      .subscribe(
        payload => {
          this.noData = this.isThereData(payload);
          if (!this.noData) {
            this.games = payload[0];
            this.users = payload[1];
            this.picks = payload[2];
            this.standingsVM = this.mapStandingsVMWithoutRank(this.games, this.users, this.picks);
            this.standingsVM = this.orderStandingsVM(this.standingsVM);
            this.standingsVM = this.mapStandingsVMWithRank(this.standingsVM);
          }
        },
        error => this.error = true
      );
  }



  isThereData(payload: {}): boolean {

    if (
      payload[0].length === 0 // games
      || payload[1].length === 0 // users
      || payload[2].length === 0 // picks
    ) {
      return true;
    }

    return false;
  }



  mapStandingsVMWithoutRank(games: Game[], users: User[], picks: Pick[]): StandingVM[] {

    const mappedStandingsVM: StandingVM[] = users.map(user => {

      const userRecord: RecordVM = this.getUserRecord(user._id, picks, games);

      return {
        _id: user._id,
        userName: user.userName,
        avatar: user.avatar,
        wins: userRecord.wins,
        losses: userRecord.losses,
        pushs: userRecord.pushs,
        points: userRecord.points,
      };
    });

    return mappedStandingsVM;
  }



  getUserRecord(userId: string, picks: Pick[], games: Game[]): RecordVM {

    const userPicks: Pick[] = picks.filter(pick => pick.userId === userId);
    let wins = 0;
    let losses = 0;
    let pushs = 0;
    let points = 0;
    let percentage = 0;

    if (userPicks.length === 0) { return {wins, losses, pushs, points, percentage}; }

    userPicks.forEach(pick => {

      const game: Game = games.find(g => g._id === pick.gameId);

      if (pick.pickedTeam === game.awayTeam) {
        if (game.awayResult === 'win') {
          wins ++;
        } else if (game.awayResult === 'loss') {
          losses ++;
        } else if (game.awayResult === 'push') {
          pushs ++;
        }
      } else /* equals homeTeam */ {
        if (game.homeResult === 'win') {
          wins ++;
        } else if (game.homeResult === 'loss') {
          losses ++;
        } else if (game.homeResult === 'push') {
          pushs ++;
        }
      }

      return;
    });

    points = wins + (pushs / 2);

    percentage = (wins / (wins + losses)) * 100;

    return {wins, losses, pushs, points, percentage};
  }



  orderStandingsVM(standings: StandingVM[]): StandingVM[] {

    if (standings.length === 0) {
      return [];
    }

    const standingsSorted = standings.sort((standingCurr, standingNext) => {

      if (standingCurr.points !== standingNext.points) {
        if (standingCurr.wins > standingNext.wins) {
          return standingNext.points - standingCurr.points;
        } else {
          return standingNext.wins - standingCurr.wins;
        }
      } else if (standingCurr.points === standingNext.points) {
        if (standingCurr.wins > standingNext.wins) {
          return standingNext.points - standingCurr.points;
        } else {
          return standingNext.wins - standingCurr.wins;
        }
      }
    });

    return standingsSorted;
  }



  mapStandingsVMWithRank(standingsVM: StandingVM[]): StandingVM[] {

    let rank = 1;
    let tieCount = 0;

    const standingsVMWithRank: StandingVM[] = standingsVM.reduce((standings, currStander, index, array) => {

      if (index === 0) {

        currStander.rank = rank;

      } else {

        if (standings[standings.length - 1].points === currStander.points) {
          rank = rank + tieCount;
          tieCount ++;
        } else {
          rank = rank + 1 + tieCount;
          tieCount = 0;
        }

        currStander.rank = rank;
      }

      standings.push(currStander);

      return standings;
    }, []);

    return standingsVMWithRank;
  }




  trackStandings(index: number, standingVM: StandingVM): string | undefined {
    return standingVM ? standingVM._id : undefined;
  }




}
