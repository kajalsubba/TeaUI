import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleSummaryComponent } from './sale-summary.component';

describe('SaleSummaryComponent', () => {
  let component: SaleSummaryComponent;
  let fixture: ComponentFixture<SaleSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SaleSummaryComponent]
    });
    fixture = TestBed.createComponent(SaleSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
