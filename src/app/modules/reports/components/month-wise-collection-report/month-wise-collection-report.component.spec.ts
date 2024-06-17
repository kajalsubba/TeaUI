import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthWiseCollectionReportComponent } from './month-wise-collection-report.component';

describe('MonthWiseCollectionReportComponent', () => {
  let component: MonthWiseCollectionReportComponent;
  let fixture: ComponentFixture<MonthWiseCollectionReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MonthWiseCollectionReportComponent]
    });
    fixture = TestBed.createComponent(MonthWiseCollectionReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
