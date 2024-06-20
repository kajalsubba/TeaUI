import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalePurchasewiseReportComponent } from './sale-purchasewise-report.component';

describe('SalePurchasewiseReportComponent', () => {
  let component: SalePurchasewiseReportComponent;
  let fixture: ComponentFixture<SalePurchasewiseReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalePurchasewiseReportComponent]
    });
    fixture = TestBed.createComponent(SalePurchasewiseReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
