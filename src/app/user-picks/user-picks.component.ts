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
  settings: any;
  teams: Team[];
  games: Game[];
  users: User[];
  picks: Pick[];
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
          this.noData = this.isThereData(payload);
          if (!this.noData) {
            this.settings = payload[0];
            this.teams = payload[1];
            this.games = payload[2];
            this.users = payload[3];
            this.picks = payload[4];
            this.picksAllowed = this.getPicksAllowed(this.settings);
            this.getCurrentWeek(this.games);
            this.userInfoPicksVM = this.mapUserInfoPicksVM(this.teams, this.games, this.users, this.picks);
            this.userInfoPicksVM = this.orderUserInfoPickVM(this.userInfoPicksVM);
          }
        },
        error => this.error = true
      );
  }



  isThereData(payload: {}): boolean {

    if (
      payload[0].length === 0 // settings
      || payload[1].length === 0 // teams
      || payload[2].length === 0 // games
    ) {
      return true;
    }

    return false;
  }



  getPicksAllowed(settings: any): number {

    if (settings.length === 0) { return 5; }

    return settings[0].picksAllowed;
  }



  getCurrentWeek(games: any): void {

    if (games.length === 0) { this.weekNum = 1; }

    this.weekNum = this.currentWeekService.getCurrentWeek(games);

    this.route.params
      .subscribe(
        (params: Params) => {
          if (params['id'] !== undefined) {
            this.weekNum = +params['id'];
            this.userInfoPicksVM = this.mapUserInfoPicksVM(this.teams, this.games, this.users, this.picks);
            this.userInfoPicksVM = this.orderUserInfoPickVM(this.userInfoPicksVM);
          }
        },
        error => this.error = true
      );
  }



  mapUserInfoPicksVM(teams: Team[], games: Game[], users: User[], picks: Pick[]): UserInfoPickVM[] {

    if (games.length === 0) { return []; }

    const userInfoPicksVM: UserInfoPickVM[] = users.map(user => {

      const usersPicks: Pick[] = picks.filter(pick => pick.userId === user._id && pick.weekNum === this.weekNum);
      let userPicksVM: any[] = [];
      let wins = 0;
      let losses = 0;
      let pushs = 0;
      let points = 0;

      if (usersPicks.length > 0) {

        usersPicks.map(pick => {

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

          return pick;
        });
      }

      points = wins + (pushs / 2);

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

    if (userInfoPicksVM.length === 0) { return []; }

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
