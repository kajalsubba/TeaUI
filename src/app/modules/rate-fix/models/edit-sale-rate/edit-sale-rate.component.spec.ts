import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSaleRateComponent } from './edit-sale-rate.component';

describe('EditSaleRateComponent', () => {
  let component: EditSaleRateComponent;
  let fixture: ComponentFixture<EditSaleRateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditSaleRateComponent]
    });
    fixture = TestBed.createComponent(EditSaleRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
