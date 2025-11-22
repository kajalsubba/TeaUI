import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysisReportComponent } from './analysis-report.component';

describe('AnalysisReportComponent', () => {
  let component: AnalysisReportComponent;
  let fixture: ComponentFixture<AnalysisReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnalysisReportComponent]
    });
    fixture = TestBed.createComponent(AnalysisReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
