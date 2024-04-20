import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradeReportComponent } from './grade-report.component';

describe('GradeReportComponent', () => {
  let component: GradeReportComponent;
  let fixture: ComponentFixture<GradeReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GradeReportComponent]
    });
    fixture = TestBed.createComponent(GradeReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
