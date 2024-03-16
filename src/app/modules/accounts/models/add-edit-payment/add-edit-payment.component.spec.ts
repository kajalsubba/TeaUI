import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditPaymentComponent } from './add-edit-payment.component';

describe('AddEditPaymentComponent', () => {
  let component: AddEditPaymentComponent;
  let fixture: ComponentFixture<AddEditPaymentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddEditPaymentComponent]
    });
    fixture = TestBed.createComponent(AddEditPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
