import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalePurchaseReportComponent } from './sale-purchase-report.component';

describe('SalePurchaseReportComponent', () => {
  let component: SalePurchaseReportComponent;
  let fixture: ComponentFixture<SalePurchaseReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalePurchaseReportComponent]
    });
    fixture = TestBed.createComponent(SalePurchaseReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
