import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StgRecoveryComponent } from './stg-recovery.component';

describe('StgRecoveryComponent', () => {
  let component: StgRecoveryComponent;
  let fixture: ComponentFixture<StgRecoveryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StgRecoveryComponent]
    });
    fixture = TestBed.createComponent(StgRecoveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
