import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StgBillHistoryComponent } from './stg-bill-history.component';

describe('StgBillHistoryComponent', () => {
  let component: StgBillHistoryComponent;
  let fixture: ComponentFixture<StgBillHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StgBillHistoryComponent]
    });
    fixture = TestBed.createComponent(StgBillHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
