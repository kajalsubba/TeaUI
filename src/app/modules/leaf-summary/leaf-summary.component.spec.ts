import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeafSummaryComponent } from './leaf-summary.component';

describe('LeafSummaryComponent', () => {
  let component: LeafSummaryComponent;
  let fixture: ComponentFixture<LeafSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeafSummaryComponent]
    });
    fixture = TestBed.createComponent(LeafSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
