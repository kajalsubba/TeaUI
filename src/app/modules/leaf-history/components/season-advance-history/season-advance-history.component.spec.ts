import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonAdvanceHistoryComponent } from './season-advance-history.component';

describe('SeasonAdvanceHistoryComponent', () => {
  let component: SeasonAdvanceHistoryComponent;
  let fixture: ComponentFixture<SeasonAdvanceHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SeasonAdvanceHistoryComponent]
    });
    fixture = TestBed.createComponent(SeasonAdvanceHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
