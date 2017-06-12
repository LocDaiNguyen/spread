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
import { GameScoreVM } from '../models/game-score.vm';
import { ScoreVM } from '../models/score.vm';
import { CurrentWeekService } from '../core/services/current-week.service';


@Component({
  selector: 'app-edit-scores',
  templateUrl: './edit-scores.component.html',
  styleUrls: ['./edit-scores.component.css']
})
export class EditScoresComponent implements OnInit {

  editScoresForm: FormGroup;
  gameScoresVM: GameScoreVM[];
  weekNum: number;
  gamesHasUpdatedScoreValue = false;
  gameHasNoSpread = false;
  gameHasNegativeScore = false;
  gameHasMissingScore = false;
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

    this.editScoresForm = this.formBuilder.group({
      games: this.formBuilder.array([])
    });
  }



  getAllData(): void {

    const settings$: Observable<any> = this.settingService.getAllSettings();
    const teams$: Observable<Team[]> = this.teamService.getAllTeams();
    const games$: Observable<Game[]> = this.gameService.getAllGames();

    Observable.forkJoin([settings$, teams$, games$])
      .subscribe(
        payload => {
          this.getCurrentWeek(payload);
          // this.gameScoresVM = this.getGameScoresVM(payload);
        },
        error => this.error = true
      );
  }



  getCurrentWeek(payload) {

    this.route.params
      .subscribe((params: Params) => {
        if (params['id'] === undefined) {
          this.weekNum = this.currentWeekService.getCurrentWeek(payload[2]);
        } else {
          this.weekNum = +params['id'];
        }
        this.gameScoresVM = this.getGameScoresVM(payload);
        this.gameScoresVM = this.orderGameScoresVM(this.gameScoresVM);
        this.addScoreToFormGroup(this.gameScoresVM);
      });

    // if (games.length === 0) {
    //   return 1;
    // }

    // return this.currentWeekService.getCurrentWeek(games);
  }



  getGameScoresVM(payload): GameScoreVM[] {

    if (
      payload[0].length === 0 // settings
      || payload[1].length === 0 // teams
      || payload[2].length === 0 // games
    ) {
      this.noData = true;
      return [];
    }

    const settings: any = payload[0];
    const teams: Team[] = payload[1];
    const games: Game[] = this.getSelectedWeekGames(payload[2]);

    const gameScoresVM: GameScoreVM[] = games.map(game => {

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
        type: 'score',
        gameNum: game.gameNum,
        weekNum: game.weekNum,
        gameTimeEastern: game.gameTimeEastern,
        homeTeam: game.homeTeam,
        homeCity: homeTeam.city,
        homeName: homeTeam.name,
        homeSpreadDisplay: game.homeSpreadDisplay,
        homeSpread: game.homeSpread,
        homeScore: game.homeScore,
        homeResult: game.homeResult,
        awayTeam: game.awayTeam,
        awayCity: awayTeam.city,
        awayName: awayTeam.name,
        awaySpreadDisplay: game.awaySpreadDisplay,
        awaySpread: game.awaySpread,
        awayScore: game.awayScore,
        awayResult: game.awayResult
      };
    });

    return gameScoresVM;
  }



  getSelectedWeekGames(games: Game[]): Game[] {

    if (games.length === 0) {
      return [];
    }

    return games.filter(game => game.weekNum === this.weekNum);
  }



  orderGameScoresVM(gameScoresVM: GameScoreVM[]): GameScoreVM[] {

    if (gameScoresVM.length === 0) {
      return [];
    }

    const gameScoresVMSorted = gameScoresVM.sort((gameCurr, gameNext) => {
      return Date.parse(gameCurr.gameTimeEastern) - Date.parse(gameNext.gameTimeEastern);
    });

    return gameScoresVMSorted;
  }



  addScoreToFormGroup(gameScoresVM: GameScoreVM[]): void {

    const control = <FormArray>this.editScoresForm.controls['games'];

    gameScoresVM.map(game => {

      control.push(
        this.formBuilder.group({
          gameId: [null, Validators.required],
          awayTeam: [null, Validators.required],
          awaySpread: [null, Validators.required],
          awayScore: [null, Validators.required],
          homeTeam: [null, Validators.required],
          homeSpread: [null, Validators.required],
          homeScore: [null, Validators.required]
        })
      );
    });
  }



  saveScores(): void {

    if (!this.editScoresForm.dirty) {
      Materialize.toast('No changes to scores form', 8000, 'orange');
      return;
    }

    this.gamesHasUpdatedScoreValue = false;
    this.gameHasNoSpread = false;
    this.gameHasMissingScore = false;
    this.gameHasNegativeScore = false;
    const scores: ScoreVM[] = this.editScoresForm.controls['games'].value;
    const controls: any = this.editScoresForm.controls['games'];

    this.checkGameScoreValue(scores);

    if (this.gameHasNoSpread || this.gameHasMissingScore || this.gameHasNegativeScore) {
      return;
    }

    this.gameScoresVM = this.gameScoresVM.map((game, i) => {

      const gameScore: ScoreVM = scores.find(score => score.gameId === game._id);

      if (
        gameScore &&
        (gameScore.awayScore !== game.awayScore || gameScore.homeScore !== game.homeScore) &&
        (controls.controls[i].dirty)
      ) {

        this.gamesHasUpdatedScoreValue = true;

        game = this.mapFormValuesToGameScoreVM(game, gameScore);

        this.gameService.updateGame(game)
          .subscribe(
            rGame => this.gameScoresVM = this.gameScoresVM.map(mGame => {
              if (mGame._id === rGame._id) {
                mGame.awayScore = rGame.awayScore;
                mGame.awayResult = rGame.awayResult;
                mGame.homeScore = rGame.homeScore;
                mGame.homeResult = rGame.homeResult;
              }
              return mGame;
            }),
            error => this.errorMsg = error.message
          );

        Materialize.toast(`${game.awayTeam} ${game.awayScore} vs ${game.homeTeam} ${game.homeScore} UPDATED`, 8000, 'teal');
      }

      return game;
    });

    if (!this.gamesHasUpdatedScoreValue) {
      Materialize.toast('Spreads are the same', 8000, 'orange');
    }
  }



  checkGameScoreValue(scores: ScoreVM[]): void {

    scores.map(score => {

      if (score.awayScore === null && score.homeScore === null) {
        return;
      }

      if (score.awaySpread === null || score.homeSpread === null) {
        this.gameHasNoSpread = true;
        Materialize.toast(`${score.awayTeam} vs ${score.homeTeam} has no spread`, 8000, 'red accent-4');
      }

      if ((score.awayScore >= 0 && score.homeScore === null) || (score.awayScore == null && score.homeScore >= 0)) {
        this.gameHasMissingScore = true;
        Materialize.toast(`${score.awayTeam} ${score.awayScore} vs ${score.homeTeam} ${score.homeScore} has missing score`, 8000, 'red accent-4');
      }

      if (score.awayScore < 0 || score.homeScore < 0) {
        this.gameHasNegativeScore = true;
        Materialize.toast(`${score.awayTeam} ${score.awayScore} vs ${score.homeTeam} ${score.homeScore} has negative score`, 8000, 'red accent-4');
      }

      return;
    });
  }



  mapFormValuesToGameScoreVM(game: GameScoreVM, gameScore: ScoreVM): GameScoreVM {

    // GET AWAY RESULT
    if (gameScore.awaySpread < 0 && gameScore.awayScore !== null) {
      if (gameScore.awayScore - gameScore.homeScore > gameScore.homeSpread) {
        game.awayResult = 'win';
      } else if (gameScore.awayScore - gameScore.homeScore === gameScore.homeSpread) {
        game.awayResult = 'push';
      } else {
        game.awayResult = 'loss';
      }
    } else if (gameScore.awaySpread === 0 && gameScore.awayScore !== null) {
      if (gameScore.awayScore - gameScore.homeScore > gameScore.homeSpread) {
        game.awayResult = 'win';
      } else if (gameScore.awayScore - gameScore.homeScore === gameScore.homeSpread) {
        game.awayResult = 'push';
      } else {
        game.awayResult = 'loss';
      }
    } else if (gameScore.awaySpread > 0 && gameScore.awayScore !== null) {
      if (gameScore.awayScore - gameScore.homeScore > gameScore.homeSpread) {
        game.awayResult = 'win';
      } else if (gameScore.awayScore - gameScore.homeScore === gameScore.homeSpread) {
        game.awayResult = 'push';
      } else {
        game.awayResult = 'loss';
      }
    }

    // GET HOME RESULT
    if (gameScore.homeSpread < 0 && gameScore.homeScore !== null) {
      if (gameScore.homeScore - gameScore.awayScore > gameScore.awaySpread) {
        game.homeResult = 'win';
      } else if (gameScore.homeScore - gameScore.awayScore === gameScore.awaySpread) {
        game.homeResult = 'push';
      } else {
        game.homeResult = 'loss';
      }
    } else if (gameScore.homeSpread === 0 && gameScore.homeScore !== null) {
      if (gameScore.homeScore - gameScore.awayScore > gameScore.awaySpread) {
        game.homeResult = 'win';
      } else if (gameScore.homeScore - gameScore.awayScore === gameScore.awaySpread) {
        game.homeResult = 'push';
      } else {
        game.homeResult = 'loss';
      }
    } else if (gameScore.homeSpread > 0 && gameScore.homeScore !== null) {
      if (gameScore.homeScore - gameScore.awayScore > gameScore.awaySpread) {
        game.homeResult = 'win';
      } else if (gameScore.homeScore - gameScore.awayScore === gameScore.awaySpread) {
        game.homeResult = 'push';
      } else {
        game.homeResult = 'loss';
      }
    }

    game.awayScore = gameScore.awayScore;
    game.homeScore = gameScore.homeScore;

    return game;
  }



  trackGames(index: number, game: GameScoreVM): string | undefined {
    return game ? game._id : undefined;
  }




}
