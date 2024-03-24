import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StgSummaryComponent } from './stg-summary.component';

describe('StgSummaryComponent', () => {
  let component: StgSummaryComponent;
  let fixture: ComponentFixture<StgSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StgSummaryComponent]
    });
    fixture = TestBed.createComponent(StgSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
