import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { Observable } from 'rxjs/Observable';

import { SettingService } from '../core/services/setting.service';
import { Team } from '../models/team.model';
import { TeamService } from '../core/services/team.service';
import { Game } from '../models/game.model';
import { GameService } from '../core/services/game.service';
import { User } from '../models/user.model';
import { AuthService } from '../core/services/auth.service';
import { Pick } from '../models/pick.model';
import { PickService } from '../core/services/pick.service';
import { UserInfoPickVM } from '../models/user-info-pick.vm';
import { CurrentWeekService } from '../core/services/current-week.service';


@Component({
  selector: 'app-user-picks',
  templateUrl: './user-picks.component.html',
  styleUrls: ['./user-picks.component.css']
})
export class UserPicksComponent implements OnInit {

  userInfoPicksVM: UserInfoPickVM[];
  picksAllowed: number;
  weekNum: number;
  error = false;
  noData = false;



  constructor(
    private settingService: SettingService,
    private teamService: TeamService,
    private gameService: GameService,
    private authService: AuthService,
    private pickService: PickService,
    private currentWeekService: CurrentWeekService,
    private route: ActivatedRoute
  ) { }



  ngOnInit(): void {
    this.getAllData();
  }



  getAllData(): void {

    const settings$: Observable<any> = this.settingService.getAllSettings();
    const teams$: Observable<Team[]> = this.teamService.getAllTeams();
    const games$: Observable<Game[]> = this.gameService.getAllGames();
    const users$: Observable<User[]> = this.authService.getAllUsers();
    const picks$: Observable<Pick[]> = this.pickService.getAllPicks();

    Observable.forkJoin([settings$, teams$, games$, users$, picks$])
      .subscribe(
        payload => {
          this.picksAllowed = this.getPicksAllowed(payload[0]);
          this.getCurrentWeek(payload);
          // this.userInfoPicksVM = this.getUserInfoPicksVM(payload);
        },
        error => this.error = true
      );
  }



  getPicksAllowed(settings: any): number {

    if (settings.length === 0) {
      return 5;
    }

    return settings[0].picksAllowed;
  }



  getCurrentWeek(payload) {

    this.route.params
      .subscribe((params: Params) => {
        if (params['id'] === undefined) {
          this.weekNum = this.currentWeekService.getCurrentWeek(payload[2]);
        } else {
          this.weekNum = +params['id'];
        }
        this.userInfoPicksVM = this.getUserInfoPicksVM(payload);
        this.userInfoPicksVM = this.orderUserInfoPickVM(this.userInfoPicksVM);
      });

    // if (games.length === 0) {
    //   return 1;
    // }

    // return this.currentWeekService.getCurrentWeek(games);
  }



  getUserInfoPicksVM(payload): UserInfoPickVM[] {

    if (
      payload[0].length === 0 // settings
      || payload[1].length === 0 // teams
      || payload[2].length === 0 // games
    ) {
      this.noData = true;
      return [];
    }

    const teams: Team[] = payload[1];
    const games: Game[] = payload[2];
    const users: User[] = payload[3];
    const picks: Pick[] = payload[4];

    const userInfoPicksVM: UserInfoPickVM[] = users.map(user => {

      const usersPicks: Pick[] = picks.filter(pick => pick.userId === user._id);
      let userPicksVM: any[] = [];
      let wins = 0;
      let losses = 0;
      let pushs = 0;
      let points = 0;

      if (usersPicks.length > 0) {

        usersPicks.map(pick => {

          const game: Game = games.find(g => g._id === pick.gameId);
          const team: Team = teams.find(t => t.abbr === pick.pickedTeam);

          if (pick.weekNum === this.weekNum) {

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

            if (new Date(game.gameTimeEastern).getTime() < new Date().getTime()) {
              isGameStarted = true;
            }

            userPicksVM.push({
              pickId: pick._id,
              pickedTeam: pick.pickedTeam,
              city: team.city,
              name: team.name,
              spread: spread,
              isGameStarted: isGameStarted,
              result: result
            });
          }

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

          points = wins + (pushs / 2);

          return pick;

        });

      }

      for (let i = (userPicksVM.length + 1); i <= this.picksAllowed; i++) {
        userPicksVM.push({pickNumber: 'Pick ' + i, isGameStarted: false});
      }

      return {
        _id: user._id,
        userName: user.userName,
        avatar: user.avatar,
        wins: wins,
        losses: losses,
        pushs: pushs,
        points: points,
        picks: userPicksVM
      };
    });

    return userInfoPicksVM;
  }



  orderUserInfoPickVM(userInfoPicksVM: UserInfoPickVM[]): UserInfoPickVM[] {

    if (userInfoPicksVM.length === 0) {
      return [];
    }

    const userInfoPicksVMSorted = userInfoPicksVM.sort((userCurr, userNext) => {
      const nameCurr = userCurr.userName.toUpperCase();
      const nameNext = userNext.userName.toUpperCase();
      if (nameCurr < nameNext) {
        return - 1;
      }
      if (nameCurr > nameNext) {
        return 1;
      }
      return 0;
    });

    return userInfoPicksVMSorted;
  }



  trackUserInfoPicks(index: number, userInfoPickVM: UserInfoPickVM): string | undefined {
    return userInfoPickVM ? userInfoPickVM._id : undefined;
  }



  trackUserPicks(index: number, userPickVM: any): string | undefined {
    return userPickVM ? userPickVM.pickId : undefined;
  }




}
