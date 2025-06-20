import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfitAndLossComponent } from './profit-and-loss.component';

describe('ProfitAndLossComponent', () => {
  let component: ProfitAndLossComponent;
  let fixture: ComponentFixture<ProfitAndLossComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfitAndLossComponent]
    });
    fixture = TestBed.createComponent(ProfitAndLossComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
