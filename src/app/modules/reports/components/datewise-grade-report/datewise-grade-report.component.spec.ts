import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatewiseGradeReportComponent } from './datewise-grade-report.component';

describe('DatewiseGradeReportComponent', () => {
  let component: DatewiseGradeReportComponent;
  let fixture: ComponentFixture<DatewiseGradeReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DatewiseGradeReportComponent]
    });
    fixture = TestBed.createComponent(DatewiseGradeReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
