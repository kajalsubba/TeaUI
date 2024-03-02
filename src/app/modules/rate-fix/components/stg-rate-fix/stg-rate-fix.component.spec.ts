import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StgRateFixComponent } from './stg-rate-fix.component';

describe('StgRateFixComponent', () => {
  let component: StgRateFixComponent;
  let fixture: ComponentFixture<StgRateFixComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StgRateFixComponent]
    });
    fixture = TestBed.createComponent(StgRateFixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
