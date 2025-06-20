import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditFactoryAccountComponent } from './add-edit-factory-account.component';

describe('AddEditFactoryAccountComponent', () => {
  let component: AddEditFactoryAccountComponent;
  let fixture: ComponentFixture<AddEditFactoryAccountComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddEditFactoryAccountComponent]
    });
    fixture = TestBed.createComponent(AddEditFactoryAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
