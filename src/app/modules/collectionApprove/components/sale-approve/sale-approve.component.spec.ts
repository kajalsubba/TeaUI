import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleApproveComponent } from './sale-approve.component';

describe('SaleApproveComponent', () => {
  let component: SaleApproveComponent;
  let fixture: ComponentFixture<SaleApproveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SaleApproveComponent]
    });
    fixture = TestBed.createComponent(SaleApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
