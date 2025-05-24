import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonAdvanceReportComponent } from './season-advance-report.component';

describe('SeasonAdvanceReportComponent', () => {
  let component: SeasonAdvanceReportComponent;
  let fixture: ComponentFixture<SeasonAdvanceReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SeasonAdvanceReportComponent]
    });
    fixture = TestBed.createComponent(SeasonAdvanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
