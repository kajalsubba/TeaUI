import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateUnFixComponent } from './rate-un-fix.component';

describe('RateUnFixComponent', () => {
  let component: RateUnFixComponent;
  let fixture: ComponentFixture<RateUnFixComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RateUnFixComponent]
    });
    fixture = TestBed.createComponent(RateUnFixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
