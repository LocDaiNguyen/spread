import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { Team } from '../models/team.model';
import { TeamService } from '../core/services/team.service';
import { Game } from '../models/game.model';
import { GameService } from '../core/services/game.service';
import { User } from '../models/user.model';
import { AuthService } from '../core/services/auth.service';
import { Pick } from '../models/pick.model';
import { PickService } from '../core/services/pick.service';
import { StandingVM } from '../models/standing.vm';
import { RecordVM } from '../models/record.vm';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {

  standingsVM: StandingVM[];
  standingText: any;
  userStanding: any;
  userId: string;
  userRecord: any;
  userPercentage: any;
  userFavRecord: any;
  userFavPercentage: any;
  userDogRecord: any;
  userDogPercentage: any;
  userTotalPointsWeekly: any;
  userPicksVM: any;
  error = false;
  noData = false;
  // options
  gradient = false;
  barPadding = 10;
  margin = true;
  showLegend = true;
  showXAxis = true;
  showXAxisLabel = true;
  xAxisLabel = 'Week';
  showYAxis = true;
  showYAxisLabel = true;
  yAxisLabel = 'Points';
  colorScheme = { domain: ['#d50000', '#dddddd'] };



  constructor(
    private teamService: TeamService,
    private gameService: GameService,
    private authService: AuthService,
    private pickService: PickService
  ) { }



  ngOnInit() {
    this.getUser();
    this.getAllData();
  }



  getUser(): void {
    this.userId = localStorage.getItem('userId');
  }



  getAllData(): void {

    
    const teams$: Observable<Team[]> = this.teamService.getAllTeams();
    const games$: Observable<Game[]> = this.gameService.getAllGames();
    const users$: Observable<User[]> = this.authService.getAllUsers();
    const picks$: Observable<Pick[]> = this.pickService.getAllPicks();

    Observable.forkJoin([teams$, games$, users$, picks$])
      .subscribe(
        payload => {
          this.standingsVM = this.getStandingsVM(payload);
          this.userStanding = this.standingsVM.find(standing => standing._id === this.userId);
          this.standingText = this.getStandingText(this.userStanding);
          this.userTotalPointsWeekly = this.getUserTotalPointsWeekly(this.userId, payload);
          this.userRecord = this.getUserRecord(this.userId, payload[3], payload[1]);
          this.userPercentage = this.getUserPecentage(this.userRecord);
          this.userFavRecord = this.getUserFavRecord(this.userId, payload[3], payload[1]);
          this.userFavPercentage = this.getUserFavPercentage(this.userFavRecord);
          this.userDogRecord = this.getUserDogRecord(this.userId, payload[3], payload[1]);
          this.userDogPercentage = this.getUserDogPercentage(this.userDogRecord);
          this.userPicksVM = this.getUserPicksVM(this.userId, payload);
          this.userPicksVM = this.orderUserPicksVM(this.userPicksVM);
        },
        error => this.error = true
      );
  }


// STANDINGS
  getStandingsVM(payload: any): StandingVM[] {

    if (
      payload[0].length === 0 //teams
      || payload[1].length === 0 // games
      || payload[2].length === 0 // users
    ) {
      this.noData = true;
      return [];
    }

    const games: Game[] = payload[1];
    const users: User[] = payload[2];
    const picks: Pick[] = payload[3];
    const standingsWithOutRank: StandingVM[] = this.mapStandingsVM(users, picks, games);
    const standingsWithOutRankOrdered: StandingVM[] = this.orderStandings(standingsWithOutRank);
    let rank = 1;
    let tieCount = 0;

    const standingsWithRankOrdered: StandingVM[] = standingsWithOutRankOrdered.reduce((standings, currStander, index, array) => {

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

    return standingsWithRankOrdered;
  }



  mapStandingsVM(users: User[], picks: Pick[], games: Game[]): StandingVM[] {

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



  orderStandings(standings: StandingVM[]): StandingVM[] {

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



  getStandingText(userStanding: StandingVM): string {
    if (userStanding.rank === 1) {
      return 'st';
    } else if (userStanding.rank === 2) {
      return 'nd';
    } else if (userStanding.rank === 3) {
      return 'rd';
    } else {
      return 'th';
    }
  }



// USER TOTAL POINTS WEEKLY
  getUserTotalPointsWeekly(userId: string, payload: any): any {
    const userPicks = this.getUserPicks(userId, payload[3]);
    const userPicksWithResult = this.getUserPicksWithResult(userPicks, payload[1]);
    const userTotalPointsWeekly = [
      { "name": "1", "series": [ { "name": this.userStanding.userName, "value": 0 } ] },
      { "name": "2", "series": [ { "name": this.userStanding.userName, "value": 0 } ] },
      { "name": "3", "series": [ { "name": this.userStanding.userName, "value": 0 } ] },
      { "name": "4", "series": [ { "name": this.userStanding.userName, "value": 0 } ] },
      { "name": "5", "series": [ { "name": this.userStanding.userName, "value": 0 } ] },
      { "name": "6", "series": [ { "name": this.userStanding.userName, "value": 0 } ] },
      { "name": "7", "series": [ { "name": this.userStanding.userName, "value": 0 } ] },
      { "name": "8", "series": [ { "name": this.userStanding.userName, "value": 0 } ] },
      { "name": "9", "series": [ { "name": this.userStanding.userName, "value": 0 } ] },
      { "name": "10", "series": [ { "name": this.userStanding.userName, "value": 0 } ] },
      { "name": "11", "series": [ { "name": this.userStanding.userName, "value": 0 } ] },
      { "name": "12", "series": [ { "name": this.userStanding.userName, "value": 0 } ] },
      { "name": "13", "series": [ { "name": this.userStanding.userName, "value": 0 } ] },
      { "name": "14", "series": [ { "name": this.userStanding.userName, "value": 0 } ] },
      { "name": "15", "series": [ { "name": this.userStanding.userName, "value": 0 } ] },
      { "name": "16", "series": [ { "name": this.userStanding.userName, "value": 0 } ] },
      { "name": "17", "series": [ { "name": this.userStanding.userName, "value": 0 } ] }
    ];
    userPicksWithResult.forEach(pick => {
      if (pick.weekNum === 1) {
        if (pick.finalResult === 'win') {
          userTotalPointsWeekly[0].series[0].value += 1;
          userTotalPointsWeekly[1].series[0].value += 1;
          userTotalPointsWeekly[2].series[0].value += 1;
          userTotalPointsWeekly[3].series[0].value += 1;
          userTotalPointsWeekly[4].series[0].value += 1;
          userTotalPointsWeekly[5].series[0].value += 1;
          userTotalPointsWeekly[6].series[0].value += 1;
          userTotalPointsWeekly[7].series[0].value += 1;
          userTotalPointsWeekly[8].series[0].value += 1;
          userTotalPointsWeekly[9].series[0].value += 1;
          userTotalPointsWeekly[10].series[0].value += 1;
          userTotalPointsWeekly[11].series[0].value += 1;
          userTotalPointsWeekly[12].series[0].value += 1;
          userTotalPointsWeekly[13].series[0].value += 1;
          userTotalPointsWeekly[14].series[0].value += 1;
          userTotalPointsWeekly[15].series[0].value += 1;
          return userTotalPointsWeekly[16].series[0].value += 1;
        } else if (pick.finalResult === 'push') {
          userTotalPointsWeekly[0].series[0].value += .5;
          userTotalPointsWeekly[1].series[0].value += .5;
          userTotalPointsWeekly[2].series[0].value += .5;
          userTotalPointsWeekly[3].series[0].value += .5;
          userTotalPointsWeekly[4].series[0].value += .5;
          userTotalPointsWeekly[5].series[0].value += .5;
          userTotalPointsWeekly[6].series[0].value += .5;
          userTotalPointsWeekly[7].series[0].value += .5;
          userTotalPointsWeekly[8].series[0].value += .5;
          userTotalPointsWeekly[9].series[0].value += .5;
          userTotalPointsWeekly[10].series[0].value += .5;
          userTotalPointsWeekly[11].series[0].value += .5;
          userTotalPointsWeekly[12].series[0].value += .5;
          userTotalPointsWeekly[13].series[0].value += .5;
          userTotalPointsWeekly[14].series[0].value += .5;
          userTotalPointsWeekly[15].series[0].value += .5;
          return userTotalPointsWeekly[16].series[0].value += .5;
        }
      }
      if (pick.weekNum === 2) {
        if (pick.finalResult === 'win') {
          userTotalPointsWeekly[2].series[0].value += 1;
          userTotalPointsWeekly[3].series[0].value += 1;
          userTotalPointsWeekly[4].series[0].value += 1;
          userTotalPointsWeekly[5].series[0].value += 1;
          userTotalPointsWeekly[6].series[0].value += 1;
          userTotalPointsWeekly[7].series[0].value += 1;
          userTotalPointsWeekly[8].series[0].value += 1;
          userTotalPointsWeekly[9].series[0].value += 1;
          userTotalPointsWeekly[10].series[0].value += 1;
          userTotalPointsWeekly[11].series[0].value += 1;
          userTotalPointsWeekly[12].series[0].value += 1;
          userTotalPointsWeekly[13].series[0].value += 1;
          userTotalPointsWeekly[14].series[0].value += 1;
          userTotalPointsWeekly[15].series[0].value += 1;
          return userTotalPointsWeekly[16].series[0].value += 1;
        } else if (pick.finalResult === 'push') {
          userTotalPointsWeekly[2].series[0].value += .5;
          userTotalPointsWeekly[3].series[0].value += .5;
          userTotalPointsWeekly[4].series[0].value += .5;
          userTotalPointsWeekly[5].series[0].value += .5;
          userTotalPointsWeekly[6].series[0].value += .5;
          userTotalPointsWeekly[7].series[0].value += .5;
          userTotalPointsWeekly[8].series[0].value += .5;
          userTotalPointsWeekly[9].series[0].value += .5;
          userTotalPointsWeekly[10].series[0].value += .5;
          userTotalPointsWeekly[11].series[0].value += .5;
          userTotalPointsWeekly[12].series[0].value += .5;
          userTotalPointsWeekly[13].series[0].value += .5;
          userTotalPointsWeekly[14].series[0].value += .5;
          userTotalPointsWeekly[15].series[0].value += .5;
          return userTotalPointsWeekly[16].series[0].value += .5;
        }
      }
      if (pick.weekNum === 3) {
        if (pick.finalResult === 'win') {
          userTotalPointsWeekly[3].series[0].value += 1;
          userTotalPointsWeekly[4].series[0].value += 1;
          userTotalPointsWeekly[5].series[0].value += 1;
          userTotalPointsWeekly[6].series[0].value += 1;
          userTotalPointsWeekly[7].series[0].value += 1;
          userTotalPointsWeekly[8].series[0].value += 1;
          userTotalPointsWeekly[9].series[0].value += 1;
          userTotalPointsWeekly[10].series[0].value += 1;
          userTotalPointsWeekly[11].series[0].value += 1;
          userTotalPointsWeekly[12].series[0].value += 1;
          userTotalPointsWeekly[13].series[0].value += 1;
          userTotalPointsWeekly[14].series[0].value += 1;
          userTotalPointsWeekly[15].series[0].value += 1;
          return userTotalPointsWeekly[16].series[0].value += 1;
        } else if (pick.finalResult === 'push') {
          userTotalPointsWeekly[3].series[0].value += .5;
          userTotalPointsWeekly[4].series[0].value += .5;
          userTotalPointsWeekly[5].series[0].value += .5;
          userTotalPointsWeekly[6].series[0].value += .5;
          userTotalPointsWeekly[7].series[0].value += .5;
          userTotalPointsWeekly[8].series[0].value += .5;
          userTotalPointsWeekly[9].series[0].value += .5;
          userTotalPointsWeekly[10].series[0].value += .5;
          userTotalPointsWeekly[11].series[0].value += .5;
          userTotalPointsWeekly[12].series[0].value += .5;
          userTotalPointsWeekly[13].series[0].value += .5;
          userTotalPointsWeekly[14].series[0].value += .5;
          userTotalPointsWeekly[15].series[0].value += .5;
          return userTotalPointsWeekly[16].series[0].value += .5;
        }
      }
      if (pick.weekNum === 4) {
        if (pick.finalResult === 'win') {
          userTotalPointsWeekly[4].series[0].value += 1;
          userTotalPointsWeekly[5].series[0].value += 1;
          userTotalPointsWeekly[6].series[0].value += 1;
          userTotalPointsWeekly[7].series[0].value += 1;
          userTotalPointsWeekly[8].series[0].value += 1;
          userTotalPointsWeekly[9].series[0].value += 1;
          userTotalPointsWeekly[10].series[0].value += 1;
          userTotalPointsWeekly[11].series[0].value += 1;
          userTotalPointsWeekly[12].series[0].value += 1;
          userTotalPointsWeekly[13].series[0].value += 1;
          userTotalPointsWeekly[14].series[0].value += 1;
          userTotalPointsWeekly[15].series[0].value += 1;
          return userTotalPointsWeekly[16].series[0].value += 1;
        } else if (pick.finalResult === 'push') {
          userTotalPointsWeekly[4].series[0].value += .5;
          userTotalPointsWeekly[5].series[0].value += .5;
          userTotalPointsWeekly[6].series[0].value += .5;
          userTotalPointsWeekly[7].series[0].value += .5;
          userTotalPointsWeekly[8].series[0].value += .5;
          userTotalPointsWeekly[9].series[0].value += .5;
          userTotalPointsWeekly[10].series[0].value += .5;
          userTotalPointsWeekly[11].series[0].value += .5;
          userTotalPointsWeekly[12].series[0].value += .5;
          userTotalPointsWeekly[13].series[0].value += .5;
          userTotalPointsWeekly[14].series[0].value += .5;
          userTotalPointsWeekly[15].series[0].value += .5;
          return userTotalPointsWeekly[16].series[0].value += .5;
        }
      }
      if (pick.weekNum === 5) {
        if (pick.finalResult === 'win') {
          userTotalPointsWeekly[5].series[0].value += 1;
          userTotalPointsWeekly[6].series[0].value += 1;
          userTotalPointsWeekly[7].series[0].value += 1;
          userTotalPointsWeekly[8].series[0].value += 1;
          userTotalPointsWeekly[9].series[0].value += 1;
          userTotalPointsWeekly[10].series[0].value += 1;
          userTotalPointsWeekly[11].series[0].value += 1;
          userTotalPointsWeekly[12].series[0].value += 1;
          userTotalPointsWeekly[13].series[0].value += 1;
          userTotalPointsWeekly[14].series[0].value += 1;
          userTotalPointsWeekly[15].series[0].value += 1;
          return userTotalPointsWeekly[16].series[0].value += 1;
        } else if (pick.finalResult === 'push') {
          userTotalPointsWeekly[5].series[0].value += .5;
          userTotalPointsWeekly[6].series[0].value += .5;
          userTotalPointsWeekly[7].series[0].value += .5;
          userTotalPointsWeekly[8].series[0].value += .5;
          userTotalPointsWeekly[9].series[0].value += .5;
          userTotalPointsWeekly[10].series[0].value += .5;
          userTotalPointsWeekly[11].series[0].value += .5;
          userTotalPointsWeekly[12].series[0].value += .5;
          userTotalPointsWeekly[13].series[0].value += .5;
          userTotalPointsWeekly[14].series[0].value += .5;
          userTotalPointsWeekly[15].series[0].value += .5;
          return userTotalPointsWeekly[16].series[0].value += .5;
        }
      }
      if (pick.weekNum === 6) {
        if (pick.finalResult === 'win') {
          userTotalPointsWeekly[6].series[0].value += 1;
          userTotalPointsWeekly[7].series[0].value += 1;
          userTotalPointsWeekly[8].series[0].value += 1;
          userTotalPointsWeekly[9].series[0].value += 1;
          userTotalPointsWeekly[10].series[0].value += 1;
          userTotalPointsWeekly[11].series[0].value += 1;
          userTotalPointsWeekly[12].series[0].value += 1;
          userTotalPointsWeekly[13].series[0].value += 1;
          userTotalPointsWeekly[14].series[0].value += 1;
          userTotalPointsWeekly[15].series[0].value += 1;
          return userTotalPointsWeekly[16].series[0].value += 1;
        } else if (pick.finalResult === 'push') {
          userTotalPointsWeekly[6].series[0].value += .5;
          userTotalPointsWeekly[7].series[0].value += .5;
          userTotalPointsWeekly[8].series[0].value += .5;
          userTotalPointsWeekly[9].series[0].value += .5;
          userTotalPointsWeekly[10].series[0].value += .5;
          userTotalPointsWeekly[11].series[0].value += .5;
          userTotalPointsWeekly[12].series[0].value += .5;
          userTotalPointsWeekly[13].series[0].value += .5;
          userTotalPointsWeekly[14].series[0].value += .5;
          userTotalPointsWeekly[15].series[0].value += .5;
          return userTotalPointsWeekly[16].series[0].value += .5;
        }
      }
      if (pick.weekNum === 7) {
        if (pick.finalResult === 'win') {
          userTotalPointsWeekly[7].series[0].value += 1;
          userTotalPointsWeekly[8].series[0].value += 1;
          userTotalPointsWeekly[9].series[0].value += 1;
          userTotalPointsWeekly[10].series[0].value += 1;
          userTotalPointsWeekly[11].series[0].value += 1;
          userTotalPointsWeekly[12].series[0].value += 1;
          userTotalPointsWeekly[13].series[0].value += 1;
          userTotalPointsWeekly[14].series[0].value += 1;
          userTotalPointsWeekly[15].series[0].value += 1;
          return userTotalPointsWeekly[16].series[0].value += 1;
        } else if (pick.finalResult === 'push') {
          userTotalPointsWeekly[7].series[0].value += .5;
          userTotalPointsWeekly[8].series[0].value += .5;
          userTotalPointsWeekly[9].series[0].value += .5;
          userTotalPointsWeekly[10].series[0].value += .5;
          userTotalPointsWeekly[11].series[0].value += .5;
          userTotalPointsWeekly[12].series[0].value += .5;
          userTotalPointsWeekly[13].series[0].value += .5;
          userTotalPointsWeekly[14].series[0].value += .5;
          userTotalPointsWeekly[15].series[0].value += .5;
          return userTotalPointsWeekly[16].series[0].value += .5;
        }
      }
      if (pick.weekNum === 8) {
        if (pick.finalResult === 'win') {
          userTotalPointsWeekly[8].series[0].value += 1;
          userTotalPointsWeekly[9].series[0].value += 1;
          userTotalPointsWeekly[10].series[0].value += 1;
          userTotalPointsWeekly[11].series[0].value += 1;
          userTotalPointsWeekly[12].series[0].value += 1;
          userTotalPointsWeekly[13].series[0].value += 1;
          userTotalPointsWeekly[14].series[0].value += 1;
          userTotalPointsWeekly[15].series[0].value += 1;
          return userTotalPointsWeekly[16].series[0].value += 1;
        } else if (pick.finalResult === 'push') {
          userTotalPointsWeekly[8].series[0].value += .5;
          userTotalPointsWeekly[9].series[0].value += .5;
          userTotalPointsWeekly[10].series[0].value += .5;
          userTotalPointsWeekly[11].series[0].value += .5;
          userTotalPointsWeekly[12].series[0].value += .5;
          userTotalPointsWeekly[13].series[0].value += .5;
          userTotalPointsWeekly[14].series[0].value += .5;
          userTotalPointsWeekly[15].series[0].value += .5;
          return userTotalPointsWeekly[16].series[0].value += .5;
        }
      }
      if (pick.weekNum === 9) {
        if (pick.finalResult === 'win') {
          userTotalPointsWeekly[9].series[0].value += 1;
          userTotalPointsWeekly[10].series[0].value += 1;
          userTotalPointsWeekly[11].series[0].value += 1;
          userTotalPointsWeekly[12].series[0].value += 1;
          userTotalPointsWeekly[13].series[0].value += 1;
          userTotalPointsWeekly[14].series[0].value += 1;
          userTotalPointsWeekly[15].series[0].value += 1;
          return userTotalPointsWeekly[16].series[0].value += 1;
        } else if (pick.finalResult === 'push') {
          userTotalPointsWeekly[9].series[0].value += .5;
          userTotalPointsWeekly[10].series[0].value += .5;
          userTotalPointsWeekly[11].series[0].value += .5;
          userTotalPointsWeekly[12].series[0].value += .5;
          userTotalPointsWeekly[13].series[0].value += .5;
          userTotalPointsWeekly[14].series[0].value += .5;
          userTotalPointsWeekly[15].series[0].value += .5;
          return userTotalPointsWeekly[16].series[0].value += .5;
        }
      }
      if (pick.weekNum === 10) {
        if (pick.finalResult === 'win') {
          userTotalPointsWeekly[10].series[0].value += 1;
          userTotalPointsWeekly[11].series[0].value += 1;
          userTotalPointsWeekly[12].series[0].value += 1;
          userTotalPointsWeekly[13].series[0].value += 1;
          userTotalPointsWeekly[14].series[0].value += 1;
          userTotalPointsWeekly[15].series[0].value += 1;
          return userTotalPointsWeekly[16].series[0].value += 1;
        } else if (pick.finalResult === 'push') {
          userTotalPointsWeekly[10].series[0].value += .5;
          userTotalPointsWeekly[11].series[0].value += .5;
          userTotalPointsWeekly[12].series[0].value += .5;
          userTotalPointsWeekly[13].series[0].value += .5;
          userTotalPointsWeekly[14].series[0].value += .5;
          userTotalPointsWeekly[15].series[0].value += .5;
          return userTotalPointsWeekly[16].series[0].value += .5;
        }
      }
      if (pick.weekNum === 11) {
        if (pick.finalResult === 'win') {
          userTotalPointsWeekly[11].series[0].value += 1;
          userTotalPointsWeekly[12].series[0].value += 1;
          userTotalPointsWeekly[13].series[0].value += 1;
          userTotalPointsWeekly[14].series[0].value += 1;
          userTotalPointsWeekly[15].series[0].value += 1;
          return userTotalPointsWeekly[16].series[0].value += 1;
        } else if (pick.finalResult === 'push') {
          userTotalPointsWeekly[11].series[0].value += .5;
          userTotalPointsWeekly[12].series[0].value += .5;
          userTotalPointsWeekly[13].series[0].value += .5;
          userTotalPointsWeekly[14].series[0].value += .5;
          userTotalPointsWeekly[15].series[0].value += .5;
          return userTotalPointsWeekly[16].series[0].value += .5;
        }
      }
      if (pick.weekNum === 12) {
        if (pick.finalResult === 'win') {
          userTotalPointsWeekly[12].series[0].value += 1;
          userTotalPointsWeekly[13].series[0].value += 1;
          userTotalPointsWeekly[14].series[0].value += 1;
          userTotalPointsWeekly[15].series[0].value += 1;
          return userTotalPointsWeekly[16].series[0].value += 1;
        } else if (pick.finalResult === 'push') {
          userTotalPointsWeekly[12].series[0].value += .5;
          userTotalPointsWeekly[13].series[0].value += .5;
          userTotalPointsWeekly[14].series[0].value += .5;
          userTotalPointsWeekly[15].series[0].value += .5;
          return userTotalPointsWeekly[16].series[0].value += .5;
        }
      }
      if (pick.weekNum === 13) {
        if (pick.finalResult === 'win') {
          userTotalPointsWeekly[13].series[0].value += 1;
          userTotalPointsWeekly[14].series[0].value += 1;
          userTotalPointsWeekly[15].series[0].value += 1;
          return userTotalPointsWeekly[16].series[0].value += 1;
        } else if (pick.finalResult === 'push') {
          userTotalPointsWeekly[13].series[0].value += .5;
          userTotalPointsWeekly[14].series[0].value += .5;
          userTotalPointsWeekly[15].series[0].value += .5;
          return userTotalPointsWeekly[16].series[0].value += .5;
        }
      }
      if (pick.weekNum === 14) {
        if (pick.finalResult === 'win') {
          userTotalPointsWeekly[14].series[0].value += 1;
          userTotalPointsWeekly[15].series[0].value += 1;
          return userTotalPointsWeekly[16].series[0].value += 1;
        } else if (pick.finalResult === 'push') {
          userTotalPointsWeekly[14].series[0].value += .5;
          userTotalPointsWeekly[15].series[0].value += .5;
          return userTotalPointsWeekly[16].series[0].value += .5;
        }
      }
      if (pick.weekNum === 15) {
        if (pick.finalResult === 'win') {
          userTotalPointsWeekly[15].series[0].value += 1;
          return userTotalPointsWeekly[16].series[0].value += 1;
        } else if (pick.finalResult === 'push') {
          userTotalPointsWeekly[15].series[0].value += .5;
          return userTotalPointsWeekly[16].series[0].value += .5;
        }
      }
      if (pick.weekNum === 16) {
        if (pick.finalResult === 'win') {
          return userTotalPointsWeekly[16].series[0].value += 1;
        } else if (pick.finalResult === 'push') {
          return userTotalPointsWeekly[16].series[0].value += .5;
        }
      }
      if (pick.weekNum === 17) {
        if (pick.finalResult === 'win') {
          return userTotalPointsWeekly[16].series[0].value += 1;
        } else if (pick.finalResult === 'push') {
          return userTotalPointsWeekly[16].series[0].value += .5;
        }
      }
    });
    return userTotalPointsWeekly;
  }



  getUserPicks(userId: string, picks: Pick[]): Pick[] {
    return picks.filter(pick => pick.userId === userId);
  }



  getUserPicksWithResult(userPicks: Pick[], games: Game[]): any {
    return userPicks.map(pick => {
      const game = games.find(g => g._id === pick.gameId);
      let finalResult;
      if (pick.pickedTeam === game.awayTeam) {
        finalResult = game.awayResult;
      } else {
        finalResult = game.homeResult;
      }
      return {
        _id: pick._id,
        pickedTeam: pick.pickedTeam,
        weekNum: pick.weekNum,
        userId: pick.userId,
        gameId: pick.gameId,
        finalResult: finalResult
      }
    })
  }



// USER RECORD
  getUserRecord(userId: string, picks: Pick[], games: Game[]): RecordVM {

    const userPicks = this.getUserPicks(userId, picks);
    let wins = 0;
    let losses = 0;
    let pushs = 0;
    let points = 0;
    let percentage = 0;

    if (userPicks.length === 0) {
      return {wins, losses, pushs, points, percentage};
    }

    userPicks.map(pick => {

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



  getUserPecentage(userRecord: any): any {
    return [{ "name": "Overall", "value": Math.round(userRecord.percentage) }];
  }




// USER FAV RECORD
  getUserFavRecord(userId: string, picks: Pick[], games: Game[]): any {
    const userPicks = this.getUserPicks(userId, picks);
    const userPicksWithFavPicks = this.getUserFavPicks(userPicks, games);
    const userFavRecord = this.getUserRecord(userId, userPicksWithFavPicks, games);
    return userFavRecord;
  }



  getUserFavPicks(userPicks: Pick[], games: Game[]): any {
    return userPicks.filter(pick => {
      const game = games.find(g => g._id === pick.gameId);
      if (pick.pickedTeam === game.awayTeam) {
        if (game.awaySpread < 0) {
          return pick;
        }
      } else {
        if (game.homeSpread < 0) {
          return pick;
        }
      }
    });
  }



  getUserFavPercentage(userFavRecord: any): any {
    return [{ "name": "Favourites", "value": Math.round(userFavRecord.percentage) }];
  }



// USER DOG RECORD
  getUserDogRecord(userId: string, picks: Pick[], games: Game[]): any {
    const userPicks = this.getUserPicks(userId, picks);
    const userPicksWithDogPicks = this.getUserDogPicks(userPicks, games);
    const userDogRecord = this.getUserRecord(userId, userPicksWithDogPicks, games);
    return userDogRecord;
  }



  getUserDogPicks(userPicks: Pick[], games: Game[]): any {
    return userPicks.filter(pick => {
      const game = games.find(g => g._id === pick.gameId);
      if (pick.pickedTeam === game.awayTeam) {
        if (game.awaySpread > 0) {
          return pick;
        }
      } else {
        if (game.homeSpread > 0) {
          return pick;
        }
      }
    });
  }



  getUserDogPercentage(userDogRecord: any): any {
    return [{ "name": "Dogs", "value": Math.round(userDogRecord.percentage) }];
  }



// USER PICKS
  getUserPicksVM(userId: string, payload: any): any {

    const teams: Team[] = payload[0];
    const games: Game[] = payload[1];
    const picks: Pick[] = payload[3];
    const userPicks: Pick[] = this.getUserPicks(userId, picks);
    let userPicksVM = userPicks.map(pick => {

      const game: Game = games.find(g => g._id === pick.gameId);
      const team: Team = teams.find(t => t.abbr === pick.pickedTeam);
      let isGameStarted = false;
      let spread = '';
      let result = '';

      if (pick.pickedTeam === game.awayTeam) {
        spread = game.awaySpreadDisplay;
        result = game.awayResult;
      } else /* equals homeTeam */ {
        spread = game.homeSpreadDisplay;
        result = game.homeResult;
      }

      return {
        pickId: pick._id,
        pickedTeam: pick.pickedTeam,
        weekNum: pick.weekNum,
        gameTimeEastern: game.gameTimeEastern,
        city: team.city,
        name: team.name,
        spread: spread,
        result: result,
      };

    });
    return userPicksVM;
  }



  orderUserPicksVM(userPicksVM: any): any {

    if (userPicksVM.length === 0) {
      return [];
    }

    const userPicksVMSorted = userPicksVM.sort((pickCurr, pickNext) => {
      return Date.parse(pickCurr.gameTimeEastern) - Date.parse(pickNext.gameTimeEastern);
    });

    return userPicksVMSorted;
  }



// ON SELECT
  onSelect(event) {
    console.log(event);
  }

}
