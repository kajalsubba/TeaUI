import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StgComponent } from './stg.component';

describe('StgComponent', () => {
  let component: StgComponent;
  let fixture: ComponentFixture<StgComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StgComponent]
    });
    fixture = TestBed.createComponent(StgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
