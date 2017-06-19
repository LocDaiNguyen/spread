import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormArrayName, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';

import { Observable } from 'rxjs/Observable';
declare const Materialize: any;

import { SettingService } from '../core/services/setting.service';
import { Team } from '../models/team.model';
import { TeamService } from '../core/services/team.service';
import { Game } from '../models/game.model';
import { GameService } from '../core/services/game.service';
import { GameSpreadVM } from '../models/game-spread.vm';
import { SpreadVM } from '../models/spread.vm';
import { CurrentWeekService } from '../core/services/current-week.service';


@Component({
  selector: 'app-edit-spreads',
  templateUrl: './edit-spreads.component.html',
  styleUrls: ['./edit-spreads.component.css']
})
export class EditSpreadsComponent implements OnInit {

  editSpreadsForm: FormGroup;
  gameSpreadsVM: GameSpreadVM[];
  teams: Team[];
  games: Game[];
  selectedWeekGames: Game[];
  weekNum: number;
  gamesHasUpdatedSpreadValue = false;
  gamesHasDiffSpreadValue = false;
  gamesHasSameSymbolValue = false;
  gamesHasMissingSymbolValue = false;
  gamesHasInvalidLastChar = false;
  errorMsg: string;
  error = false;
  noData = false;



  constructor(
    private settingService: SettingService,
    private teamService: TeamService,
    private gameService: GameService,
    private currentWeekService: CurrentWeekService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute
  ) { }



  ngOnInit(): void {

    this.getAllData();

    this.editSpreadsForm = this.formBuilder.group({
      games: this.formBuilder.array([])
    });
  }



  getAllData(): void {

    const settings$: Observable<any> = this.settingService.getAllSettings();
    const games$: Observable<Game[]> = this.gameService.getAllGames();
    const teams$: Observable<Team[]> = this.teamService.getAllTeams();

    Observable.forkJoin([settings$, teams$, games$])
      .subscribe(
        payload => {
          this.noData = this.isThereData(payload);
          if (!this.noData) {
            this.teams = payload[1];
            this.games = payload[2];
            this.getCurrentWeek(this.games);
            this.selectedWeekGames = this.getSelectedWeekGames(this.games);
            this.gameSpreadsVM = this.mapGameSpreadsVM(this.teams, this.selectedWeekGames);
            this.gameSpreadsVM = this.orderGameSpreadsVM(this.gameSpreadsVM);
            this.addSpreadToFormGroup(this.gameSpreadsVM);
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



  getCurrentWeek(games: Game[]): void {

    if (games.length === 0) { this.weekNum = 1; }

    this.weekNum = this.currentWeekService.getCurrentWeek(games);

    this.route.params
      .subscribe(
        (params: Params) => {
          if (params['id'] !== undefined) { this.weekNum = +params['id']; }
          this.selectedWeekGames = this.getSelectedWeekGames(this.games);
          this.gameSpreadsVM = this.mapGameSpreadsVM(this.teams, this.selectedWeekGames);
          this.gameSpreadsVM = this.orderGameSpreadsVM(this.gameSpreadsVM);
          this.addSpreadToFormGroup(this.gameSpreadsVM);
        },
        error => this.error = true
      );
  }



  getSelectedWeekGames(games: Game[]): Game[] {

    if (games.length === 0) { return []; }

    return games.filter(game => game.weekNum === this.weekNum);
  }



  mapGameSpreadsVM(teams: Team[], games: Game[]): GameSpreadVM[] {

    if (games.length === 0) { return []; }

    const gameSpreadsVM: GameSpreadVM[] = games.map(game => {

      const awayTeam: Team = teams.find(team => team.abbr === game.awayTeam);
      const homeTeam: Team = teams.find(team => team.abbr === game.homeTeam);

      if (!awayTeam) {
        awayTeam.city = 'City';
        awayTeam.name = 'Name';
      }
      if (!homeTeam) {
        homeTeam.city = 'City';
        homeTeam.name = 'Name';
      }

      return {
        _id: game._id,
        type: 'spread',
        weekNum: game.weekNum,
        gameTimeEastern: game.gameTimeEastern,
        homeTeam: game.homeTeam,
        homeCity: homeTeam.city,
        homeName: homeTeam.name,
        homeSpreadDisplay: game.homeSpreadDisplay,
        homeSpread: game.homeSpread,
        homeResult: game.homeResult,
        awayTeam: game.awayTeam,
        awayCity: awayTeam.city,
        awayName: awayTeam.name,
        awaySpreadDisplay: game.awaySpreadDisplay,
        awaySpread: game.awaySpread,
        awayResult: game.awayResult
      };
    });

    return gameSpreadsVM;
  }



  orderGameSpreadsVM(gameSpreadsVM: GameSpreadVM[]): GameSpreadVM[] {

    if (gameSpreadsVM.length === 0) { return []; }

    const gameSpreadsVMSorted = gameSpreadsVM.sort((gameCurr, gameNext) => {
      return Date.parse(gameCurr.gameTimeEastern) - Date.parse(gameNext.gameTimeEastern);
    });

    return gameSpreadsVMSorted;
  }



  addSpreadToFormGroup(gameSpreadsVM: GameSpreadVM[]): void {

    const control = <FormArray>this.editSpreadsForm.controls['games'];

    gameSpreadsVM.forEach(game => {

      control.push(
        this.formBuilder.group({
          gameId: [game._id, Validators.required],
          awayTeam: [game.awayTeam, Validators.required],
          awaySpreadDisplay: [game.awaySpreadDisplay, Validators.required],
          homeTeam: [game.homeTeam, Validators.required],
          homeSpreadDisplay: [game.homeSpreadDisplay, Validators.required]
        })
      );
    });
  }



  saveSpreads(): void {

    if (!this.editSpreadsForm.dirty) {
      Materialize.toast('No changes to spreads form', 8000, 'orange');
      return;
    }

    this.gamesHasUpdatedSpreadValue = false;
    this.gamesHasDiffSpreadValue = false;
    this.gamesHasSameSymbolValue = false;
    this.gamesHasMissingSymbolValue = false;
    this.gamesHasInvalidLastChar = false;
    const spreads: SpreadVM[] = this.editSpreadsForm.controls['games'].value;
    const controls: any = this.editSpreadsForm.controls['games'];
    this.checkGameHasMissingSymbolValue(spreads);
    this.checkGameHasSameSymbolValue(spreads);
    this.checkGameHasInvalidLastChar(spreads);
    this.checkGameHasDiffSpreadValue(spreads);

    if (this.gamesHasMissingSymbolValue || this.gamesHasSameSymbolValue || this.gamesHasDiffSpreadValue || this.gamesHasInvalidLastChar) { return; }

    this.gameSpreadsVM = this.gameSpreadsVM.map((game, i) => {

      const gameSpread: SpreadVM = spreads.find(spread => spread.gameId === game._id);

      if (
        gameSpread &&
        (gameSpread.awaySpreadDisplay !== game.awaySpreadDisplay || gameSpread.homeSpreadDisplay !== game.homeSpreadDisplay) &&
        (controls.controls[i].dirty)
      ) {

        this.gamesHasUpdatedSpreadValue = true;

        game = this.mapFormValuesToGameSpreadVM(game, gameSpread);

        this.gameService.updateGame(game)
          .subscribe(
            rGame => this.gameSpreadsVM = this.gameSpreadsVM.map(mGame => {
              if (mGame._id === rGame._id) {
                mGame.awaySpread = rGame.awaySpread;
                mGame.awaySpreadDisplay = rGame.awaySpreadDisplay;
                mGame.homeSpread = rGame.homeSpread;
                mGame.homeSpreadDisplay = rGame.homeSpreadDisplay;
              }
              return mGame;
            }),
            error => this.errorMsg = error.message
          );

        Materialize.toast(`${game.awayTeam} ${game.awaySpread} vs ${game.homeTeam} ${game.homeSpread} UPDATED`, 8000, 'teal');
      }

      return game;
    });

    if (!this.gamesHasUpdatedSpreadValue) {
      Materialize.toast('Spreads are the same', 8000, 'orange');
    }
  }



  // checkGameSpreadValue(spreads: SpreadVM[]): void {

  //   spreads.map(spread => {

  //     if (spread.awaySpreadDisplay === '' && spread.homeSpreadDisplay === '') {
  //       return;
  //     }

  //     // if (Math.abs(parseFloat(spread.awaySpreadDisplay)) !== 0 && Math.abs(parseFloat(spread.homeSpreadDisplay)) !== 0) {

  //     const awayTeamSymbol: string = spread.awaySpreadDisplay.charAt(0);
  //     const homeTeamSymbol: string = spread.homeSpreadDisplay.charAt(0);
  //     const awayLastChar: any = spread.awaySpreadDisplay.slice(-1);
  //     const homeLastChar: any = spread.homeSpreadDisplay.slice(-1);
  //     const regex = /^\d+$/;

  //     if ((awayTeamSymbol !== '+' && awayTeamSymbol !== '-') || (homeTeamSymbol !== '+' && homeTeamSymbol !== '-')) {
  //       this.gamesHasMissingSymbolValue = true;
  //       Materialize.toast(`${spread.awayTeam} ${spread.awaySpreadDisplay} vs ${spread.homeTeam} ${spread.homeSpreadDisplay} missing symbol or not correct symbol`, 8000, 'red accent-4');
  //       return;
  //     }

  //     if (awayTeamSymbol === homeTeamSymbol) {
  //       this.gamesHasSameSymbolValue = true;
  //       Materialize.toast(`${spread.awayTeam} ${spread.awaySpreadDisplay} vs ${spread.homeTeam} ${spread.homeSpreadDisplay} same symbol`, 8000, 'red accent-4');
  //       return;
  //     }

  //     if (!regex.test(awayLastChar) || !regex.test(homeLastChar)) {
  //       this.gamesHasInvalidLastChar = true;
  //       Materialize.toast(`${spread.awayTeam} ${spread.awaySpreadDisplay} vs ${spread.homeTeam} ${spread.homeSpreadDisplay} invalid last character`, 8000, 'red accent-4');
  //       return;
  //     }

  //     // }

  //     if (Math.abs(parseFloat(spread.awaySpreadDisplay)) !== Math.abs(parseFloat(spread.homeSpreadDisplay))) {
  //       this.gamesHasDiffSpreadValue = true;
  //       Materialize.toast(`${spread.awayTeam} ${spread.awaySpreadDisplay} vs ${spread.homeTeam} ${spread.homeSpreadDisplay} different spread value`, 8000, 'red accent-4' );
  //       return;
  //     }

  //     return;
  //   });
  // }



  checkGameHasMissingSymbolValue(spreads: SpreadVM[]): void {

    spreads.forEach(spread => {

      if (spread.awaySpreadDisplay === '' && spread.homeSpreadDisplay === '') { return; }

      const awayTeamSymbol: string = spread.awaySpreadDisplay.charAt(0);
      const homeTeamSymbol: string = spread.homeSpreadDisplay.charAt(0);

      if ((awayTeamSymbol !== '+' && awayTeamSymbol !== '-') || (homeTeamSymbol !== '+' && homeTeamSymbol !== '-')) {
        this.gamesHasMissingSymbolValue = true;
        Materialize.toast(`${spread.awayTeam} ${spread.awaySpreadDisplay} vs ${spread.homeTeam} ${spread.homeSpreadDisplay} missing symbol or not correct symbol`, 8000, 'red accent-4');
        return;
      }

      return;
    });
  }



  checkGameHasSameSymbolValue(spreads: SpreadVM[]): void {

    spreads.forEach(spread => {

      if (spread.awaySpreadDisplay === '' && spread.homeSpreadDisplay === '') { return; }

      const awayTeamSymbol: string = spread.awaySpreadDisplay.charAt(0);
      const homeTeamSymbol: string = spread.homeSpreadDisplay.charAt(0);

      if (awayTeamSymbol === homeTeamSymbol) {
        this.gamesHasSameSymbolValue = true;
        Materialize.toast(`${spread.awayTeam} ${spread.awaySpreadDisplay} vs ${spread.homeTeam} ${spread.homeSpreadDisplay} same symbol`, 8000, 'red accent-4');
        return;
      }

      return;
    });
  }



  checkGameHasInvalidLastChar(spreads: SpreadVM[]): void {

    spreads.forEach(spread => {

      if (spread.awaySpreadDisplay === '' && spread.homeSpreadDisplay === '') { return; }

      const awayLastChar: any = spread.awaySpreadDisplay.slice(-1);
      const homeLastChar: any = spread.homeSpreadDisplay.slice(-1);
      const regex = /^\d+$/;

      if (!regex.test(awayLastChar) || !regex.test(homeLastChar)) {
        this.gamesHasInvalidLastChar = true;
        Materialize.toast(`${spread.awayTeam} ${spread.awaySpreadDisplay} vs ${spread.homeTeam} ${spread.homeSpreadDisplay} invalid last character`, 8000, 'red accent-4');
        return;
      }

      return;
    });
  }



  checkGameHasDiffSpreadValue(spreads: SpreadVM[]): void {

    spreads.forEach(spread => {

      if (spread.awaySpreadDisplay === '' && spread.homeSpreadDisplay === '') { return; }

      if (Math.abs(parseFloat(spread.awaySpreadDisplay)) !== Math.abs(parseFloat(spread.homeSpreadDisplay))) {
        this.gamesHasDiffSpreadValue = true;
        Materialize.toast(`${spread.awayTeam} ${spread.awaySpreadDisplay} vs ${spread.homeTeam} ${spread.homeSpreadDisplay} different spread value`, 8000, 'red accent-4' );
        return;
      }

      return;
    });
  }



  mapFormValuesToGameSpreadVM(game: GameSpreadVM, spread: SpreadVM): GameSpreadVM {

    let awaySpreadDisplay = spread.awaySpreadDisplay;
    let homeSpreadDisplay = spread.homeSpreadDisplay;
    let awaySpread = parseFloat(awaySpreadDisplay);
    let homeSpread = parseFloat(homeSpreadDisplay);

    if (parseFloat(awaySpreadDisplay) === 0) {
      awaySpreadDisplay = '0';
      awaySpread = 0;
    }
    if (parseFloat(homeSpreadDisplay) === 0) {
      homeSpreadDisplay = '0';
      homeSpread = 0;
    }

    if (isNaN(awaySpread)) {
      awaySpread = undefined;
    }
    if (isNaN(homeSpread)) {
      homeSpread = undefined;
    }

    game.awaySpreadDisplay = awaySpreadDisplay;
    game.awaySpread = awaySpread;
    game.homeSpreadDisplay = homeSpreadDisplay;
    game.homeSpread = homeSpread;

    return game;

  }



  trackGames(index: number, game: GameSpreadVM): string | undefined {
    return game ? game._id : undefined;
  }




}
