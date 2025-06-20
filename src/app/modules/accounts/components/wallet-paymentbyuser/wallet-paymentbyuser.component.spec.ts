import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletPaymentbyuserComponent } from './wallet-paymentbyuser.component';

describe('WalletPaymentbyuserComponent', () => {
  let component: WalletPaymentbyuserComponent;
  let fixture: ComponentFixture<WalletPaymentbyuserComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WalletPaymentbyuserComponent]
    });
    fixture = TestBed.createComponent(WalletPaymentbyuserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
