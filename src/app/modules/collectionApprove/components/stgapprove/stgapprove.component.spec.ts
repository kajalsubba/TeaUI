import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StgapproveComponent } from './stgapprove.component';

describe('StgapproveComponent', () => {
  let component: StgapproveComponent;
  let fixture: ComponentFixture<StgapproveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StgapproveComponent]
    });
    fixture = TestBed.createComponent(StgapproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
