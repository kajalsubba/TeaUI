import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeafHistoryComponent } from './leaf-history.component';

describe('LeafHistoryComponent', () => {
  let component: LeafHistoryComponent;
  let fixture: ComponentFixture<LeafHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeafHistoryComponent]
    });
    fixture = TestBed.createComponent(LeafHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
