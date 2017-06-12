import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPicksAllComponent } from './user-picks-all.component';

describe('UserPicksAllComponent', () => {
  let component: UserPicksAllComponent;
  let fixture: ComponentFixture<UserPicksAllComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserPicksAllComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserPicksAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
