import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierBillHistoryComponent } from './supplier-bill-history.component';

describe('SupplierBillHistoryComponent', () => {
  let component: SupplierBillHistoryComponent;
  let fixture: ComponentFixture<SupplierBillHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SupplierBillHistoryComponent]
    });
    fixture = TestBed.createComponent(SupplierBillHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
