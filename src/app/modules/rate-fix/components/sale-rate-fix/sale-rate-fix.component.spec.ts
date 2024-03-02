import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleRateFixComponent } from './sale-rate-fix.component';

describe('SaleRateFixComponent', () => {
  let component: SaleRateFixComponent;
  let fixture: ComponentFixture<SaleRateFixComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SaleRateFixComponent]
    });
    fixture = TestBed.createComponent(SaleRateFixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
