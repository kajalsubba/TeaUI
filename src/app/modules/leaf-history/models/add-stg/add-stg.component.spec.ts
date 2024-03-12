import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStgComponent } from './add-stg.component';

describe('AddStgComponent', () => {
  let component: AddStgComponent;
  let fixture: ComponentFixture<AddStgComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddStgComponent]
    });
    fixture = TestBed.createComponent(AddStgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
