import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleEntryComponent } from './sale-entry.component';

describe('SaleEntryComponent', () => {
  let component: SaleEntryComponent;
  let fixture: ComponentFixture<SaleEntryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SaleEntryComponent]
    });
    fixture = TestBed.createComponent(SaleEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
