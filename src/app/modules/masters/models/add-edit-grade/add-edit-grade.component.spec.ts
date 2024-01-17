import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditGradeComponent } from './add-edit-grade.component';

describe('AddEditGradeComponent', () => {
  let component: AddEditGradeComponent;
  let fixture: ComponentFixture<AddEditGradeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddEditGradeComponent]
    });
    fixture = TestBed.createComponent(AddEditGradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
