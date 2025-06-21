import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoveryHistoryComponent } from './recovery-history.component';

describe('RecoveryHistoryComponent', () => {
  let component: RecoveryHistoryComponent;
  let fixture: ComponentFixture<RecoveryHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RecoveryHistoryComponent]
    });
    fixture = TestBed.createComponent(RecoveryHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
