import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StgHistoryComponent } from './stg-history.component';

describe('StgHistoryComponent', () => {
  let component: StgHistoryComponent;
  let fixture: ComponentFixture<StgHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StgHistoryComponent]
    });
    fixture = TestBed.createComponent(StgHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
