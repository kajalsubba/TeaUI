import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDialogRemarksComponent } from './confirm-dialog-remarks.component';

describe('ConfirmDialogRemarksComponent', () => {
  let component: ConfirmDialogRemarksComponent;
  let fixture: ComponentFixture<ConfirmDialogRemarksComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmDialogRemarksComponent]
    });
    fixture = TestBed.createComponent(ConfirmDialogRemarksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
