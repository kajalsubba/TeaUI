import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditPaymentTypeComponent } from './add-edit-payment-type.component';

describe('AddEditPaymentTypeComponent', () => {
  let component: AddEditPaymentTypeComponent;
  let fixture: ComponentFixture<AddEditPaymentTypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddEditPaymentTypeComponent]
    });
    fixture = TestBed.createComponent(AddEditPaymentTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
