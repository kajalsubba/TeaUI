import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonAdvanceComponent } from './season-advance.component';

describe('SeasonAdvanceComponent', () => {
  let component: SeasonAdvanceComponent;
  let fixture: ComponentFixture<SeasonAdvanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SeasonAdvanceComponent]
    });
    fixture = TestBed.createComponent(SeasonAdvanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
