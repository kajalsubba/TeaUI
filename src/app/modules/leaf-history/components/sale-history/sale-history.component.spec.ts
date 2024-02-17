import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleHistoryComponent } from './sale-history.component';

describe('SaleHistoryComponent', () => {
  let component: SaleHistoryComponent;
  let fixture: ComponentFixture<SaleHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SaleHistoryComponent]
    });
    fixture = TestBed.createComponent(SaleHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
