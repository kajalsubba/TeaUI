import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletCreationComponent } from './wallet-creation.component';

describe('WalletCreationComponent', () => {
  let component: WalletCreationComponent;
  let fixture: ComponentFixture<WalletCreationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WalletCreationComponent]
    });
    fixture = TestBed.createComponent(WalletCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
