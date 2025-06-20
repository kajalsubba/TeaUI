import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditTenantComponent } from './add-edit-tenant.component';

describe('AddEditTenantComponent', () => {
  let component: AddEditTenantComponent;
  let fixture: ComponentFixture<AddEditTenantComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddEditTenantComponent]
    });
    fixture = TestBed.createComponent(AddEditTenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
