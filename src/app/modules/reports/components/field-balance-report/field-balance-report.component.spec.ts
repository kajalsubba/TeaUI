import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldBalanceReportComponent } from './field-balance-report.component';

describe('FieldBalanceReportComponent', () => {
  let component: FieldBalanceReportComponent;
  let fixture: ComponentFixture<FieldBalanceReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FieldBalanceReportComponent]
    });
    fixture = TestBed.createComponent(FieldBalanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
