import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierRateFixComponent } from './supplier-rate-fix.component';

describe('SupplierRateFixComponent', () => {
  let component: SupplierRateFixComponent;
  let fixture: ComponentFixture<SupplierRateFixComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SupplierRateFixComponent]
    });
    fixture = TestBed.createComponent(SupplierRateFixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
