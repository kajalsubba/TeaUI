import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditFinancialYearComponent } from './add-edit-financial-year.component';

describe('AddEditFinancialYearComponent', () => {
  let component: AddEditFinancialYearComponent;
  let fixture: ComponentFixture<AddEditFinancialYearComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddEditFinancialYearComponent]
    });
    fixture = TestBed.createComponent(AddEditFinancialYearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
