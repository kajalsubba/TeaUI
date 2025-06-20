import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSupplierRateComponent } from './edit-supplier-rate.component';

describe('EditSupplierRateComponent', () => {
  let component: EditSupplierRateComponent;
  let fixture: ComponentFixture<EditSupplierRateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditSupplierRateComponent]
    });
    fixture = TestBed.createComponent(EditSupplierRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
