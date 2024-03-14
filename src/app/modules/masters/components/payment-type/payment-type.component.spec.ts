import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentTypeComponent } from './payment-type.component';

describe('PaymentTypeComponent', () => {
  let component: PaymentTypeComponent;
  let fixture: ComponentFixture<PaymentTypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentTypeComponent]
    });
    fixture = TestBed.createComponent(PaymentTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
