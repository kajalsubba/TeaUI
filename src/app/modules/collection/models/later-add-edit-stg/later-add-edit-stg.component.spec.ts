import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaterAddEditStgComponent } from './later-add-edit-stg.component';

describe('LaterAddEditStgComponent', () => {
  let component: LaterAddEditStgComponent;
  let fixture: ComponentFixture<LaterAddEditStgComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LaterAddEditStgComponent]
    });
    fixture = TestBed.createComponent(LaterAddEditStgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
