import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { Observable } from 'rxjs/Observable';

import { SettingService } from '../core/services/setting.service';
import { Team } from '../models/team.model';
import { TeamService } from '../core/services/team.service';
import { Game } from '../models/game.model';
import { GameService } from '../core/services/game.service';
import { GamePickVM } from '../models/game-pick.vm';
import { User } from '../models/user.model';
import { AuthService } from '../core/services/auth.service';
import { Pick } from '../models/pick.model';
import { PickService } from '../core/services/pick.service';
import { PickDistributionVM } from '../models/pick-distribution.vm';
import { CurrentWeekService } from '../core/services/current-week.service';


@Component({
  selector: 'app-pick-distributions',
  templateUrl: './pick-distributions.component.html',
  styleUrls: ['./pick-distributions.component.css']
})
export class PickDistributionsComponent implements OnInit {

  pickDistributionsVM: PickDistributionVM[];
  teams: Team[];
  games: Game[];
  users: User[];
  picks: Pick[];
  selectedWeekGames: Game[];
  selectedWeekPicks: Pick[];
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

    const settings$: Observable<any[]> = this.settingService.getAllSettings();
    const teams$: Observable<Team[]> = this.teamService.getAllTeams();
    const games$: Observable<Game[]> = this.gameService.getAllGames();
    const users$: Observable<User[]> = this.authService.getAllUsers();
    const picks$: Observable<Pick[]> = this.pickService.getAllPicks();

    Observable.forkJoin([settings$, teams$, games$, users$, picks$])
      .subscribe(
        payload => {
          this.noData = this.isThereData(payload);
          if (!this.noData) {
            this.teams = payload[1];
            this.games = payload[2];
            this.users = payload[3];
            this.picks = payload[4];
            this.getCurrentWeek(this.games);
            this.selectedWeekGames = this.getSelectedWeekGames(this.games);
            this.selectedWeekPicks = this.getSelectedWeekPicks(this.picks);
            this.pickDistributionsVM = this.mapPickDistributionsVM(this.teams, this.selectedWeekGames, this.selectedWeekPicks, this.users);
            this.pickDistributionsVM = this.orderGameScoresVM(this.pickDistributionsVM);
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



  getCurrentWeek(games: any): void {

    if (games.length === 0) { this.weekNum = 1; }

    this.weekNum = this.currentWeekService.getCurrentWeek(games);

    this.route.params
      .subscribe(
        (params: Params) => {
          if (params['id'] !== undefined) {
            this.weekNum = +params['id'];
            this.selectedWeekGames = this.getSelectedWeekGames(this.games);
            this.selectedWeekPicks = this.getSelectedWeekPicks(this.picks);
            this.pickDistributionsVM = this.mapPickDistributionsVM(this.teams, this.selectedWeekGames, this.selectedWeekPicks, this.users);
            this.pickDistributionsVM = this.orderGameScoresVM(this.pickDistributionsVM);
          }
        },
        error => this.error = true
      );
  }



  getSelectedWeekGames(games: Game[]): Game[] {

    if (games.length === 0) { return []; }

    return games.filter(game => game.weekNum === this.weekNum);
  }



  getSelectedWeekPicks(picks: Pick[]): Pick[] {

    if (picks.length === 0) { return []; }

    return picks.filter(pick => pick.weekNum === this.weekNum);
  }



  mapPickDistributionsVM(teams: Team[], games: Game[], picks: Pick[], users: User[]): PickDistributionVM[] {

    const pickDistributionsVM: PickDistributionVM[] = games.map(game => {

      const awayTeam: Team = teams.find(team => team.abbr === game.awayTeam);
      const homeTeam: Team = teams.find(team => team.abbr === game.homeTeam);
      const awayTeamPicks: Pick[] = this.getAwayTeamPicks(picks, game);
      const homeTeamPicks: Pick[] = this.getHomeTeamPicks(picks, game);
      const awayTeamPicksVM: {pickedTeam: string, userName: string}[] = this.mapPickDistToPicksVM(awayTeamPicks, users);
      const homeTeamPicksVM: {pickedTeam: string, userName: string}[] = this.mapPickDistToPicksVM(homeTeamPicks, users);
      const awayPicksCount: number = awayTeamPicks.length;
      const homePicksCount: number = homeTeamPicks.length;
      let awayPercentage = '0%';
      let homePercentage = '0%';
      let isGameStarted = false;

      if (!awayTeam) {
        awayTeam.city = 'City';
        awayTeam.name = 'Name';
      }
      if (!homeTeam) {
        homeTeam.city = 'City';
        homeTeam.name = 'Name';
      }

      if (awayTeamPicks.length > 0 || homeTeamPicks.length > 0) {
        awayPercentage = ((awayTeamPicks.length / (awayTeamPicks.length + homeTeamPicks.length)) * 100).toString() + '%';
        homePercentage = ((homeTeamPicks.length / (awayTeamPicks.length + homeTeamPicks.length)) * 100).toString() + '%';
      } else if (homeTeamPicks.length === 0 && awayTeamPicks.length === 0) {
        awayPercentage = '50%';
        homePercentage = '50%';
      }

      if (new Date(game.gameTimeEastern).getTime() < new Date().getTime()) {
        isGameStarted = true;
      }

      return {
        _id: game._id,
        weekNum: game.weekNum,
        gameTimeEastern: game.gameTimeEastern,
        homeTeam: game.homeTeam,
        homeCity: homeTeam.city,
        homeName: homeTeam.name,
        homeSpreadDisplay: game.homeSpreadDisplay,
        homeSpread: game.homeSpread,
        homeScore: game.homeScore,
        homeResult: game.homeResult,
        homePicksCount: homePicksCount,
        homePercentage: homePercentage,
        homePicks: homeTeamPicksVM,
        awayTeam: game.awayTeam,
        awayCity: awayTeam.city,
        awayName: awayTeam.name,
        awaySpreadDisplay: game.awaySpreadDisplay,
        awaySpread: game.awaySpread,
        awayScore: game.awayScore,
        awayResult: game.awayResult,
        awayPicksCount: awayPicksCount,
        awayPercentage: awayPercentage,
        awayPicks: awayTeamPicksVM,
        isGameStarted: isGameStarted
      };

    });

    return pickDistributionsVM;
  }



  getHomeTeamPicks(picks: Pick[], game: Game): Pick[] {

    if (picks.length === 0) { return []; }

    return picks.filter(pick => pick.gameId === game._id && pick.pickedTeam === game.homeTeam);
  }



  getAwayTeamPicks(picks: Pick[], game: Game): Pick[] {

    if (picks.length === 0) { return []; }

    return picks.filter(pick => pick.gameId === game._id && pick.pickedTeam === game.awayTeam);
  }



  mapPickDistToPicksVM(picks: Pick[], users: User[]): {pickedTeam: string, userName: string}[] {

    if (picks.length === 0) { return []; }

    const mappedPicksVM: {pickedTeam: string, userName: string}[] = picks.map(pick => {

      const user: User = users.find(u => u._id === pick.userId);

      if (!user) { user.userName = 'user does not exist'; }

      return {
        pickedTeam: pick.pickedTeam,
        userName: user.userName,
        id: pick._id
      };
    });

    return mappedPicksVM;
  }



  orderGameScoresVM(pickDistributionsVM: PickDistributionVM[]): PickDistributionVM[] {

    if (pickDistributionsVM.length === 0) { return []; }

    const pickDistributionsVMSorted = pickDistributionsVM.sort((gameCurr, gameNext) => {
      return Date.parse(gameCurr.gameTimeEastern) - Date.parse(gameNext.gameTimeEastern);
    });

    return pickDistributionsVMSorted;
  }




  trackPicksDistribution(index: number, pickDistributionVM: PickDistributionVM): string | undefined {
    return pickDistributionVM ? pickDistributionVM._id : undefined;
  }




}
