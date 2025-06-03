import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditWalletComponent } from './add-edit-wallet.component';

describe('AddEditWalletComponent', () => {
  let component: AddEditWalletComponent;
  let fixture: ComponentFixture<AddEditWalletComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddEditWalletComponent]
    });
    fixture = TestBed.createComponent(AddEditWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
