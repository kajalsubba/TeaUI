import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierBillGenerateComponent } from './supplier-bill-generate.component';

describe('SupplierBillGenerateComponent', () => {
  let component: SupplierBillGenerateComponent;
  let fixture: ComponentFixture<SupplierBillGenerateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SupplierBillGenerateComponent]
    });
    fixture = TestBed.createComponent(SupplierBillGenerateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
