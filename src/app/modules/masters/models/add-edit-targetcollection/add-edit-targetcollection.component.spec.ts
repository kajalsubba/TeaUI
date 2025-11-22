import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditTargetcollectionComponent } from './add-edit-targetcollection.component';

describe('AddEditTargetcollectionComponent', () => {
  let component: AddEditTargetcollectionComponent;
  let fixture: ComponentFixture<AddEditTargetcollectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddEditTargetcollectionComponent]
    });
    fixture = TestBed.createComponent(AddEditTargetcollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
