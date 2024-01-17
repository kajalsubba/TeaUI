import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditFactoryComponent } from './add-edit-factory.component';

describe('AddEditFactoryComponent', () => {
  let component: AddEditFactoryComponent;
  let fixture: ComponentFixture<AddEditFactoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddEditFactoryComponent]
    });
    fixture = TestBed.createComponent(AddEditFactoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
