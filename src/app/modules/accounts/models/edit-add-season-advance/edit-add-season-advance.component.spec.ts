import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAddSeasonAdvanceComponent } from './edit-add-season-advance.component';

describe('EditAddSeasonAdvanceComponent', () => {
  let component: EditAddSeasonAdvanceComponent;
  let fixture: ComponentFixture<EditAddSeasonAdvanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditAddSeasonAdvanceComponent]
    });
    fixture = TestBed.createComponent(EditAddSeasonAdvanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
