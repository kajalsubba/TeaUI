import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditClientComponent } from './add-edit-client.component';

describe('AddEditClientComponent', () => {
  let component: AddEditClientComponent;
  let fixture: ComponentFixture<AddEditClientComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddEditClientComponent]
    });
    fixture = TestBed.createComponent(AddEditClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
