import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSaleEntryComponent } from './edit-sale-entry.component';

describe('EditSaleEntryComponent', () => {
  let component: EditSaleEntryComponent;
  let fixture: ComponentFixture<EditSaleEntryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditSaleEntryComponent]
    });
    fixture = TestBed.createComponent(EditSaleEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
