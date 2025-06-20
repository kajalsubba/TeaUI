import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditStgComponent } from './add-edit-stg.component';

describe('AddEditStgComponent', () => {
  let component: AddEditStgComponent;
  let fixture: ComponentFixture<AddEditStgComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddEditStgComponent]
    });
    fixture = TestBed.createComponent(AddEditStgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
