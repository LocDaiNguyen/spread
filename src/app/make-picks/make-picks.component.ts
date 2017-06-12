import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormArrayName, FormControl, Validators } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
declare const Materialize: any;

import { SettingService } from '../core/services/setting.service';
import { Team } from '../models/team.model';
import { TeamService } from '../core/services/team.service';
import { Game } from '../models/game.model';
import { GameService } from '../core/services/game.service';
import { GamePickVM } from '../models/game-pick.vm';
import { Pick } from '../models/pick.model';
import { PickService } from '../core/services/pick.service';
import { CurrentWeekService } from '../core/services/current-week.service';

@Component({
  selector: 'app-make-picks',
  templateUrl: './make-picks.component.html',
  styleUrls: ['./make-picks.component.css']
})
export class MakePicksComponent implements OnInit {

  makePicksForm: FormGroup;
  gamePicksVM: GamePickVM[];
  teams: Team[];
  userPrevPicks: Pick[];
  userPicksCount = 0;
  userPicksGameStartedCount = 0;
  picksAllowed: number;
  weekNum: number;
  userId: string;
  errorMsg: string;
  error = false;
  noData = false;

  @ViewChild('button') button: ElementRef;



  constructor(
    private settingService: SettingService,
    private teamService: TeamService,
    private gameService: GameService,
    private pickService: PickService,
    private currentWeekService: CurrentWeekService,
    private renderer: Renderer2,
    private formBuilder: FormBuilder
  ) { }



  ngOnInit(): void {

    this.getUser();
    this.getAllData();

    this.makePicksForm = this.formBuilder.group({
      games: this.formBuilder.array([])
    });
  }



  getUser(): void {
    this.userId = localStorage.getItem('userId');
  }



  getAllData(): void {

    const settings$: Observable<any> = this.settingService.getAllSettings();
    const teams$: Observable<Team[]> = this.teamService.getAllTeams();
    const games$: Observable<Game[]> = this.gameService.getAllGames();
    const picks$: Observable<Pick[]> = this.pickService.getAllPicks();

    Observable.forkJoin([settings$, teams$, games$, picks$])
      .subscribe(
        payload => {
          this.picksAllowed = this.getPicksAllowed(payload[0]);
          this.weekNum = this.getCurrentWeek(payload[2]);
          this.gamePicksVM = this.getGamePicksVM(payload);
          this.gamePicksVM = this.orderGamePicksVM(this.gamePicksVM);
          this.userPrevPicks = this.getUserPrevPicks(payload[3]);
          this.addMatchupToFormGroup(this.gamePicksVM, this.userPrevPicks);
          this.manageGamePicksVMStateByPicksAllowed();
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



  getCurrentWeek(games: any): number {

    if (games.length === 0) {
      return 1;
    }

    return this.currentWeekService.getCurrentWeek(games);
  }



  getGamePicksVM(payload: {}): GamePickVM[] {

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
    const picks: Pick[] = this.getUserPrevPicks(payload[3]);

    const gamePicksVM: GamePickVM[] = games.map(game => {

      const pick: Pick = picks.find(p => p.gameId === game._id);
      const awayTeam: Team = teams.find(team => team.abbr === game.awayTeam);
      const homeTeam: Team = teams.find(team => team.abbr === game.homeTeam);
      let isHomePicked = false;
      let isAwayPicked = false;
      let isGameStarted = false;

      if (pick) {
        this.userPicksCount ++;
        if (new Date(game.gameTimeEastern).getTime() < new Date().getTime()) {
          this.userPicksGameStartedCount ++;
        }
        if (pick.pickedTeam === game.awayTeam) {
          isAwayPicked = true;
        } else if (pick.pickedTeam === game.homeTeam) {
          isHomePicked = true;
        }
      }

      if (!awayTeam) {
        awayTeam.city = 'City';
        awayTeam.name = 'Name';
      }
      if (!homeTeam) {
        homeTeam.city = 'City';
        homeTeam.name = 'Name';
      }

      if (new Date(game.gameTimeEastern).getTime() < new Date().getTime()) {
        isGameStarted = true;
      }

      return {
        _id: game._id,
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
        awayResult: game.awayResult,
        isHomePicked: isHomePicked,
        isAwayPicked: isAwayPicked,
        isHomeDisabled: false,
        isAwayDisabled: false,
        isGameStarted: isGameStarted
      };
    });

    return gamePicksVM;
  }



  getSelectedWeekGames(games: Game[]): Game[] {

    if (games.length === 0) {
      return [];
    }

    return games.filter(game => game.weekNum === this.weekNum);
  }



  getUserPrevPicks(picks: Pick[]): Pick[] {

    if (picks.length === 0) {
      return [];
    }

    return picks.filter(pick => pick.weekNum === this.weekNum && pick.userId === this.userId);
  }



  orderGamePicksVM(gamePicksVM: GamePickVM[]): GamePickVM[] {

    if (gamePicksVM.length === 0) {
      return [];
    }

    const gamePicksVMSorted = gamePicksVM.sort((gameCurr, gameNext) => {
      return Date.parse(gameCurr.gameTimeEastern) - Date.parse(gameNext.gameTimeEastern);
    });

    return gamePicksVMSorted;
  }



  addMatchupToFormGroup(gamePickVM: GamePickVM[], userPrevPicks: Pick[]): void {

    const control = <FormArray>this.makePicksForm.controls['games'];

    gamePickVM.map(game => {

      const pick: Pick = userPrevPicks.find(p => p.gameId === game._id);
      let isHomePicked = false;
      let isAwayPicked = false;

      if (pick) {
        if (pick.pickedTeam === game.awayTeam) {
          isAwayPicked = true;
        } else if (pick.pickedTeam === game.homeTeam) {
          isHomePicked = true;
        }
      }

      control.push(
        this.formBuilder.group({
          gameId: [game._id, Validators.required],
          weekNum: [game.weekNum, Validators.required],
          isAwayPicked: [{value: isAwayPicked, disabled: false}, Validators.required],
          awayTeam: [game.awayTeam, Validators.required],
          isHomePicked: [{value: isHomePicked, disabled: false}, Validators.required],
          homeTeam: [game.homeTeam, Validators.required]
        })
      );
    });
  }



  updateFormGroup(games: GamePickVM[]): void {

    const gamesForm = <FormArray>this.makePicksForm.controls['games'];
    const newGamePicksFormValue = games.map(game => {

      return {
        gameId: game._id,
        weekNum: game.weekNum,
        isAwayPicked: {value: game.isAwayPicked, disabled: game.isAwayDisabled},
        awayTeam: game.awayTeam,
        isHomePicked: {value: game.isHomePicked, disabled: game.isHomeDisabled},
        homeTeam: game.homeTeam
      };
    });

    gamesForm.reset(newGamePicksFormValue);
    this.makePicksForm.markAsDirty();
  }



// VIEW INTERACTION STATE
  manageGamePicksVMStateByPicksAllowed(): void {

    if (this.userPicksCount >= this.picksAllowed) {
      this.gamePicksVM = this.gamePicksVM.map(game => {

        if (!game.isAwayPicked) {
          game.isAwayDisabled = true;
        }
        if (!game.isHomePicked) {
          game.isHomeDisabled = true;
        }

        return game;
      });

    } else {
      this.gamePicksVM = this.gamePicksVM.map(game => {

        if (!game.isAwayPicked) {
          game.isAwayDisabled = false;
        }
        if (!game.isHomePicked) {
          game.isHomeDisabled = false;
        }

        return game;
      });
    }

    this.updateFormGroup(this.gamePicksVM);
  }



  checkboxChanged(value: any): void {

    if (value.checked === true) {
      this.manageGamePicksVMStateByCheckboxChanged(true, value.gameId, value.team);
    } else {
      this.manageGamePicksVMStateByCheckboxChanged(false, value.gameId, value.team);
    }
  }



  manageGamePicksVMStateByCheckboxChanged(picked: boolean, gameId: string, team: string): void {

    this.gamePicksVM = this.gamePicksVM.map(game => {

      if (game._id === gameId) {
        if (game.awayTeam === team) {
          game.isAwayPicked = picked;
          this.manageUserPicksCountState(picked);
          if (game.isHomePicked === true) {
            game.isHomePicked = false;
            this.manageUserPicksCountState(false);
          }
        } else if (game.homeTeam === team) {
          game.isHomePicked = picked;
          this.manageUserPicksCountState(picked);
          if (game.isAwayPicked === true) {
            game.isAwayPicked = false;
            this.manageUserPicksCountState(false);
          }
        }
      }

      return game;
    });

    this.updateFormGroup(this.gamePicksVM);
  }



  manageUserPicksCountState = (picked) => {

    if (picked === true) {
      this.userPicksCount ++;
      this.manageGamePicksVMStateByPicksAllowed();
    } else {
      this.userPicksCount --;
      this.manageGamePicksVMStateByPicksAllowed();
    }
  }



// SUBMISSION
  savePicks(): void {

    if (!this.makePicksForm.dirty) {
      Materialize.toast('No changes to picks form', 8000, 'orange');
      return;
    }

    const userCurrentPicks: Pick[] = this.mapPickValuesToPick();
    const userNewPicks: Pick[] = this.getUserNewPicks(userCurrentPicks);
    const userDeletePicks: Pick[] = this.getUserDeletePicks(userCurrentPicks);
    const isGameStarted: boolean = this.isGameStartedInAnyOfUserCurrentPicks(userCurrentPicks);

    this.renderer.setProperty(this.button.nativeElement, 'disabled', true);
    setTimeout(() => this.renderer.setProperty(this.button.nativeElement, 'disabled', false), 2000);

    if (userCurrentPicks.length === 0) {
      return;
    }

    if ((this.userPicksGameStartedCount + userCurrentPicks.length) <= this.picksAllowed) {
      if (!isGameStarted) {
        if (userNewPicks.length === 0 && userDeletePicks.length === 0) {
          Materialize.toast('Picks are the same', 8000, 'orange');
        } else {
          this.createPicks(userNewPicks);
          this.deletePicks(userDeletePicks);
          Materialize.toast('Picks UPDATED', 8000, 'teal');
        }
      } else {
        Materialize.toast('One or more games have already started', 8000, 'red accent-4');
      }
    } else {
      Materialize.toast(`Picks limit of ${this.picksAllowed} exceeded`, 8000, 'red accent-4');
    }
  }



  mapPickValuesToPick(): Pick[] {

    const mappedPicks: Pick[] = this.makePicksForm.controls['games'].value.map(game => {

      if (!game.isAwayPicked && !game.isHomePicked) {
        return;
      }

      if (game.isAwayPicked) {
        return {
          pickedTeam: game.awayTeam,
          weekNum: game.weekNum,
          gameId: game.gameId,
        };
      } else {
        return {
          pickedTeam: game.homeTeam,
          weekNum: game.weekNum,
          gameId: game.gameId,
        };
      }
    });

    const userCurrentPicks = mappedPicks.filter(pick => !!pick);

    if (userCurrentPicks.length === 0 && this.userPrevPicks.length > 0) {
      this.deletePicks(this.userPrevPicks);
      Materialize.toast('Picks UPDATED', 8000, 'teal');
    }

    return userCurrentPicks;
  }



  getUserNewPicks(userCurrentPicks: Pick[]): Pick[] {

    if (userCurrentPicks.length === 0) {
      return [];
    }

    const userCurrentPicksUnfiltered = userCurrentPicks.map(pick => {

      const game: Game = this.gamePicksVM.find(gamePickVM => gamePickVM._id === pick.gameId);
      const gameTime: number = new Date(game.gameTimeEastern).getTime();
      const currentTime: number = new Date().getTime();
      let alreadyPicked = false;

      if (!game) {
        return;
      }

      if (gameTime < currentTime) {
        // game already started, can't pick this game anymore
        return;
      } else {
        this.userPrevPicks.map(userPrevPick => {
          if (userPrevPick.pickedTeam === pick.pickedTeam) {
            alreadyPicked = true;
          }
          return;
        });
        if (!alreadyPicked) {
          return pick;
        }
      }

      return;
    });

    const userNewPicks = userCurrentPicksUnfiltered.filter(pick => !!pick);

    return userNewPicks;
  }



  getUserDeletePicks(userCurrentPicks: Pick[]): Pick[] {

    if (userCurrentPicks.length === 0) {
      return [];
    }

    const userCurrentPicksUnfiltered = this.userPrevPicks.map(prevPick => {

      const game: Game = this.gamePicksVM.find(gamePickVM => gamePickVM._id === prevPick.gameId);
      const gameTime: number = new Date(game.gameTimeEastern).getTime();
      const currentTime: number = new Date().getTime();
      let notPicked = true;

      if (!game) {
        return;
      }

      if (gameTime > currentTime) {
        userCurrentPicks.map(pick => {
          if (prevPick.pickedTeam === pick.pickedTeam) {
            notPicked = false;
          }
          return;
        });
        if (notPicked) {
          return prevPick;
        }
      }

      return;
    });

    const userDeletePicks = userCurrentPicksUnfiltered.filter(pick => !!pick);

    return userDeletePicks;
  }



  isGameStartedInAnyOfUserCurrentPicks(userCurrentPicks: Pick[]): boolean {

    if (userCurrentPicks.length === 0) {
      return false;
    }

    let isGameStarted = false;

    userCurrentPicks.map(pick => {

      const game: Game = this.gamePicksVM.find(gamePickVM => gamePickVM._id === pick.gameId);
      const gameTime: number = new Date(game.gameTimeEastern).getTime();
      const currentTime: number = new Date().getTime();

      if (!game) {
        return;
      }

      if (gameTime < currentTime) {
        // game already started, can't pick this game anymore
        isGameStarted = true;
      }

      return;
    });

    return isGameStarted;
  }



  createPicks(userNewPicks: Pick[]): void {

    userNewPicks.map(pick =>
      this.pickService.createPick(pick)
        .subscribe(
          createdPick => this.userPrevPicks.push(createdPick),
          error => this.errorMsg = error.message
        )
    );
  }



  deletePicks(userDeletePicks: Pick[]): void {

    userDeletePicks.map(pick =>
      this.pickService.deletePick(pick)
        .subscribe(
          deletedPick => this.userPrevPicks = this.userPrevPicks.filter(notDeletedPick =>
            notDeletedPick._id !== deletedPick._id
          ),
          error => this.errorMsg = error.message
        )
    );
  }


// TRACK
  trackGames(index: number, game: GamePickVM): string | undefined {
    return game ? game._id : undefined;
  }




}
