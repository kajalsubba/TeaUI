import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateFixComponent } from './rate-fix.component';

describe('RateFixComponent', () => {
  let component: RateFixComponent;
  let fixture: ComponentFixture<RateFixComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RateFixComponent]
    });
    fixture = TestBed.createComponent(RateFixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
