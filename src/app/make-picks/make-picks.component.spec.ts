import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockBackend } from '@angular/http/testing';
import { XHRBackend } from '@angular/http';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/forkJoin';

import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';

import { SettingService } from '../core/services/setting.service';
import { TeamService } from '../core/services/team.service';
import { GameService } from '../core/services/game.service';
import { PickService } from '../core/services/pick.service';
import { CurrentWeekService } from '../core/services/current-week.service';

import { MakePicksComponent } from './make-picks.component';
import { MatchupComponent } from './matchup/matchup.component';
import { TeamComponent } from '../shared/team/team.component';
import { ErrorValidationComponent } from '../shared/error-validation/error-validation.component';
import { ErrorServerComponent } from '../shared/error-server/error-server.component';
import { SuccessValidationComponent } from '../shared/success-validation/success-validation.component';
import { NoDataComponent } from '../shared/no-data/no-data.component';

describe('MakePicksComponent', () => {
  let component: MakePicksComponent;
  let fixture: ComponentFixture<MakePicksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        HttpModule,
        RouterModule,
        ReactiveFormsModule,
        RouterTestingModule,
      ],
      providers: [
        SettingService,
        TeamService,
        GameService,
        PickService,
        CurrentWeekService,
        {provide: XHRBackend, useClass: MockBackend}
      ],
      declarations: [
        MakePicksComponent,
        MatchupComponent,
        TeamComponent,
        ErrorValidationComponent,
        ErrorServerComponent,
        SuccessValidationComponent,
        NoDataComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MakePicksComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // it('should load settings, teams, games, picks from server', () => {
  //   let settingService = fixture.debugElement.injector.get('SettingService');
  //   let teamService = fixture.debugElement.injector.get('TeamService');
  //   let gameService = fixture.debugElement.injector.get('GameService');
  //   let pickService = fixture.debugElement.injector.get('PickService');
  //   spyOn(settingService, 'getAllSettings').and.returnValue(Observable.from([ {_id: 1} ]));
  //   spyOn(teamService, 'getAllTeams').and.returnValue(Observable.from([ {_id: 1} ]));
  //   spyOn(gameService, 'getAllGames').and.returnValue(Observable.from([ {_id: 1} ]));
  //   spyOn(pickService, 'getAllPicks').and.returnValue(Observable.from([ {_id: 1} ]));
    
  //   fixture.detectChanges();

  //   component.getAllData();

  //   expect(component.teams.length).toBe(1)
  // })
});
